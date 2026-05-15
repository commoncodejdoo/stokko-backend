import { Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AuditAction } from '../common/audit-action';
import { AuthContext } from '../common/auth-context';
import {
  CrossOrgAccessError,
  EntityNotFoundError,
} from '../common/errors';
import { TxClient } from '../common/transaction';
import { OrganizationsService } from '../organizations/organizations.service';
import { PrismaService } from '../../data/common/prisma/prisma.service';
import { PredictionSnapshot, Urgency } from './prediction-snapshot.domain';
import {
  CreatePredictionSnapshotInput,
  ListCurrentSnapshotsFilter,
  PredictionsRepository,
} from './predictions.repository';
import { computeRules } from './rules-engine';

/** Window over which we average daily consumption to compute the signal. */
const CONSUMPTION_WINDOW_DAYS = 28;
/** Snapshots are considered fresh for this many hours after computedAt. */
const SNAPSHOT_VALIDITY_HOURS = 26;

export interface RecomputeSummary {
  organizationId: string;
  computedAt: Date;
  totalTuples: number;
  criticalCount: number;
  warningCount: number;
  okCount: number;
  shouldReorderCount: number;
}

@Injectable()
export class PredictionsService {
  constructor(
    private readonly repo: PredictionsRepository,
    private readonly orgs: OrganizationsService,
    private readonly auditLog: AuditLogService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Read-side: return the latest snapshot for each (warehouse, article) tuple.
   */
  async listLatest(
    filter: ListCurrentSnapshotsFilter,
    tx?: TxClient,
  ): Promise<PredictionSnapshot[]> {
    await this.orgs.requireById(filter.organizationId, tx);
    return this.repo.listLatest(filter, tx);
  }

  async findLatestFor(
    organizationId: string,
    articleId: string,
    warehouseId: string,
    tx?: TxClient,
  ): Promise<PredictionSnapshot> {
    await this.orgs.requireById(organizationId, tx);
    const snap = await this.repo.findLatestForArticleWarehouse(
      organizationId,
      articleId,
      warehouseId,
      tx,
    );
    if (!snap) {
      throw new EntityNotFoundError(
        'PredictionSnapshot',
        `${articleId}/${warehouseId}`,
      );
    }
    if (snap.organizationId !== organizationId) {
      throw new CrossOrgAccessError('PredictionSnapshot', snap.id);
    }
    return snap;
  }

  /**
   * Compute predictions for every (warehouse, article) tuple in the org.
   *
   * For each tuple:
   *  1. currentStock from StockEntry
   *  2. avgDailyConsumption — Sale items for FOH warehouses, outgoing
   *     StockTransferItems for STORAGE warehouses (over CONSUMPTION_WINDOW_DAYS)
   *  3. rules engine produces urgency + suggestedQty
   *  4. row written to PredictionSnapshot
   *
   * One summarising audit-log row per recompute (not per snapshot).
   */
  async recomputeOrg(
    organizationId: string,
    actorUserId: string | null,
  ): Promise<RecomputeSummary> {
    const org = await this.orgs.requireById(organizationId);
    const computedAt = new Date();
    const validUntil = new Date(
      computedAt.getTime() + SNAPSHOT_VALIDITY_HOURS * 60 * 60 * 1000,
    );
    const since = new Date(
      computedAt.getTime() - CONSUMPTION_WINDOW_DAYS * 24 * 60 * 60 * 1000,
    );

    // 1. Load all active warehouses and articles for the org.
    const [warehouses, articles] = await Promise.all([
      this.prisma.warehouse.findMany({
        where: { organizationId, deletedAt: null },
        select: { id: true, kind: true },
      }),
      this.prisma.article.findMany({
        where: { organizationId, deletedAt: null },
        select: {
          id: true,
          thresholdWarning: true,
          thresholdCritical: true,
        },
      }),
    ]);

    if (warehouses.length === 0 || articles.length === 0) {
      return {
        organizationId,
        computedAt,
        totalTuples: 0,
        criticalCount: 0,
        warningCount: 0,
        okCount: 0,
        shouldReorderCount: 0,
      };
    }

    // 2. Load all current stock entries for the org's warehouses.
    const warehouseIds = warehouses.map((w) => w.id);
    const stockEntries = await this.prisma.stockEntry.findMany({
      where: { warehouseId: { in: warehouseIds } },
      select: { articleId: true, warehouseId: true, quantity: true },
    });
    // Map: key = warehouseId|articleId
    const stockMap = new Map<string, Decimal>();
    for (const e of stockEntries) {
      stockMap.set(
        `${e.warehouseId}|${e.articleId}`,
        new Decimal(e.quantity.toString()),
      );
    }

    // 3. Pre-aggregate FOH consumption (SaleItems) per (warehouseId, articleId).
    const fohWarehouseIds = warehouses
      .filter((w) => w.kind === 'FOH')
      .map((w) => w.id);
    const storageWarehouseIds = warehouses
      .filter((w) => w.kind === 'STORAGE')
      .map((w) => w.id);

    const fohConsumption = await this.aggregateSaleItems(
      organizationId,
      fohWarehouseIds,
      since,
    );
    const storageConsumption = await this.aggregateTransferOut(
      organizationId,
      storageWarehouseIds,
      since,
    );

    // 4. For each (warehouse, article) tuple, compute the snapshot.
    const inputs: CreatePredictionSnapshotInput[] = [];
    let criticalCount = 0;
    let warningCount = 0;
    let okCount = 0;
    let shouldReorderCount = 0;

    for (const w of warehouses) {
      const consumptionMap =
        w.kind === 'FOH' ? fohConsumption : storageConsumption;
      const perWarehouse = consumptionMap.get(w.id) ?? new Map<string, Decimal>();

      for (const a of articles) {
        const key = `${w.id}|${a.id}`;
        const currentStock = stockMap.get(key) ?? new Decimal(0);
        const totalConsumed = perWarehouse.get(a.id) ?? new Decimal(0);
        const avgDailyConsumption = totalConsumed.isZero()
          ? null
          : totalConsumed.div(CONSUMPTION_WINDOW_DAYS);

        const rules = computeRules({
          currentStock,
          thresholdWarning: new Decimal(a.thresholdWarning.toString()),
          thresholdCritical: new Decimal(a.thresholdCritical.toString()),
          avgDailyConsumption,
          leadTimeDays: org.defaultLeadTimeDays ?? 2,
          safetyDays: org.defaultSafetyDays ?? 1,
          coverageDays: org.defaultCoverageDays ?? 7,
        });

        inputs.push({
          organizationId,
          warehouseId: w.id,
          articleId: a.id,
          currentStock,
          avgDailyConsumption,
          daysOfSupply: rules.daysOfSupply,
          shouldReorder: rules.shouldReorder,
          suggestedQty: rules.suggestedQty,
          urgency: rules.urgency,
          leadTimeDaysUsed: org.defaultLeadTimeDays ?? 2,
          safetyDaysUsed: org.defaultSafetyDays ?? 1,
          coverageDaysUsed: org.defaultCoverageDays ?? 7,
          signalWindowDays: CONSUMPTION_WINDOW_DAYS,
          validUntil,
        });

        if (rules.urgency === 'CRITICAL') criticalCount += 1;
        else if (rules.urgency === 'WARNING') warningCount += 1;
        else okCount += 1;
        if (rules.shouldReorder) shouldReorderCount += 1;
      }
    }

    // 5. Batch insert all snapshots in a single transaction.
    await this.prisma.$transaction(async (tx) => {
      for (const input of inputs) {
        await this.repo.create(input, tx);
      }
      // Audit only when a human triggered the recompute. The cron path skips
      // this — snapshots themselves are the durable record and per-day audit
      // rows would just be noise.
      if (actorUserId) {
        await this.auditLog.record(
          {
            organizationId,
            userId: actorUserId,
            action: AuditAction.RECOMMENDATION_GENERATED,
            entityType: 'PredictionRecompute',
            entityId: organizationId,
            before: null,
            after: {
              computedAt: computedAt.toISOString(),
              totalTuples: inputs.length,
              criticalCount,
              warningCount,
              okCount,
              shouldReorderCount,
              signalWindowDays: CONSUMPTION_WINDOW_DAYS,
            },
          },
          tx,
        );
      }
    });

    return {
      organizationId,
      computedAt,
      totalTuples: inputs.length,
      criticalCount,
      warningCount,
      okCount,
      shouldReorderCount,
    };
  }

  /**
   * Recompute predictions for every active organization. Bounded concurrency
   * keeps the Neon connection pool from being overwhelmed when the daily cron
   * fires across all tenants.
   */
  async recomputeAllOrgs(): Promise<RecomputeSummary[]> {
    const orgs = await this.prisma.organization.findMany({
      where: { isActive: true },
      select: { id: true },
    });
    const results: RecomputeSummary[] = [];
    // Sequential is fine — N tenants * compute cost; Neon free tier is happier.
    for (const org of orgs) {
      try {
        const summary = await this.recomputeOrg(org.id, null);
        results.push(summary);
      } catch (err) {
        // Don't let one org's failure block the rest.
        // eslint-disable-next-line no-console
        console.error(`[predictions] recompute failed for org ${org.id}`, err);
      }
    }
    return results;
  }

  // ─────── helpers ───────

  /** Returns Map<warehouseId, Map<articleId, totalQuantityInWindow>>. */
  private async aggregateSaleItems(
    organizationId: string,
    warehouseIds: string[],
    since: Date,
  ): Promise<Map<string, Map<string, Decimal>>> {
    const result = new Map<string, Map<string, Decimal>>();
    if (warehouseIds.length === 0) return result;

    // SaleItem rows joined to Sale (warehouseId scoped).
    const items = await this.prisma.saleItem.findMany({
      where: {
        sale: {
          organizationId,
          warehouseId: { in: warehouseIds },
          createdAt: { gte: since },
        },
      },
      select: {
        articleId: true,
        quantity: true,
        sale: { select: { warehouseId: true } },
      },
    });

    for (const it of items) {
      const whMap = result.get(it.sale.warehouseId) ?? new Map();
      const existing = whMap.get(it.articleId) ?? new Decimal(0);
      whMap.set(
        it.articleId,
        existing.plus(new Decimal(it.quantity.toString())),
      );
      result.set(it.sale.warehouseId, whMap);
    }
    return result;
  }

  /** STORAGE consumption proxy: items transferred OUT of this warehouse. */
  private async aggregateTransferOut(
    organizationId: string,
    sourceWarehouseIds: string[],
    since: Date,
  ): Promise<Map<string, Map<string, Decimal>>> {
    const result = new Map<string, Map<string, Decimal>>();
    if (sourceWarehouseIds.length === 0) return result;

    const items = await this.prisma.stockTransferItem.findMany({
      where: {
        transfer: {
          organizationId,
          sourceWarehouseId: { in: sourceWarehouseIds },
          createdAt: { gte: since },
        },
      },
      select: {
        articleId: true,
        quantity: true,
        transfer: { select: { sourceWarehouseId: true } },
      },
    });

    for (const it of items) {
      const whMap =
        result.get(it.transfer.sourceWarehouseId) ?? new Map<string, Decimal>();
      const existing = whMap.get(it.articleId) ?? new Decimal(0);
      whMap.set(
        it.articleId,
        existing.plus(new Decimal(it.quantity.toString())),
      );
      result.set(it.transfer.sourceWarehouseId, whMap);
    }
    return result;
  }

}
