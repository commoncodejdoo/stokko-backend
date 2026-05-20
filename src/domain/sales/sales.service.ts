import { Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { ArticlesService } from '../articles/articles.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AuditAction } from '../common/audit-action';
import { AuthContext } from '../common/auth-context';
import {
  CrossOrgAccessError,
  DomainValidationError,
  EntityNotFoundError,
} from '../common/errors';
import { TxClient } from '../common/transaction';
import { OrganizationsService } from '../organizations/organizations.service';
import { StockService } from '../stock/stock.service';
import { TransfersService } from '../transfers/transfers.service';
import { WarehousesService } from '../warehouses/warehouses.service';
import { WarehouseStockTargetsService } from '../warehouse-stock-targets/warehouse-stock-targets.service';
import { PrismaService } from '../../data/common/prisma/prisma.service';
import { Sale } from './sale.domain';
import {
  ListShiftsFilter,
  PaginatedShifts,
  SalesRepository,
  ShiftWithSales,
} from './sales.repository';
import { Shift } from './shift.domain';

export interface CloseShiftItemCommand {
  articleId: string;
  warehouseId: string;
  quantity: string | number | Decimal;
}

export interface ReplenishOverrideCommand {
  warehouseId: string;
  articleId: string;
  targetQty: string | number | Decimal;
}

export interface ReplenishCommand {
  sourceWarehouseId: string;
  overrides?: ReplenishOverrideCommand[];
  skipWarehouseIds?: string[];
}

export interface CloseShiftCommand {
  items: CloseShiftItemCommand[];
  replenish?: ReplenishCommand;
}

export type ReplenishItemStatus = 'ok' | 'partial' | 'insufficient' | 'no_target';

export interface ReplenishItemPreview {
  articleId: string;
  currentStock: string;
  projectedStock: string;
  targetQty: string | null;
  delta: string;
  availableInSource: string;
  willTransferQty: string;
  status: ReplenishItemStatus;
  overridden: boolean;
}

export interface ReplenishWarehousePreview {
  warehouseId: string;
  items: ReplenishItemPreview[];
}

export interface ReplenishPreview {
  sourceWarehouseId: string;
  warehouses: ReplenishWarehousePreview[];
}

@Injectable()
export class SalesService {
  constructor(
    private readonly repo: SalesRepository,
    private readonly orgs: OrganizationsService,
    private readonly warehouses: WarehousesService,
    private readonly articles: ArticlesService,
    private readonly stock: StockService,
    private readonly stockTargets: WarehouseStockTargetsService,
    private readonly transfers: TransfersService,
    private readonly auditLog: AuditLogService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Close today's Shift. Inside one transaction:
   *   1. Resolve (or open) today's Shift.
   *   2. Reject if it is already CLOSED.
   *   3. Validate every warehouse is FOH and every article belongs to the org.
   *   4. Group items by warehouse → one Sale per FOH location.
   *   5. Snapshot salePrice from Article at this moment as Sale.unitPrice.
   *   6. Decrement stock at the FOH warehouse (StockService rejects negatives).
   *   7. Persist Shift totals + status=CLOSED, closedAt, closedById.
   *   8. Emit SALE_CREATED per Sale + SHIFT_CLOSED on the shift.
   */
  async closeShift(cmd: CloseShiftCommand, ctx: AuthContext): Promise<ShiftWithSales> {
    if (!cmd.items?.length) {
      throw new DomainValidationError('At least one item is required');
    }

    return this.prisma.$transaction(async (tx) => {
      const org = await this.orgs.requireById(ctx.organizationId, tx);
      const today = todayUtcMidnight();
      let shift = await this.repo.upsertShift(
        { organizationId: ctx.organizationId, date: today },
        tx,
      );
      if (shift.isClosed()) {
        throw new DomainValidationError(
          'Smjena za današnji dan je već zatvorena',
          { shiftId: shift.id },
        );
      }

      // Group items by warehouse — one Sale per (shift, warehouse).
      type Bucket = {
        warehouseId: string;
        items: { articleId: string; quantity: Decimal; unitPrice: Decimal }[];
      };
      const buckets = new Map<string, Bucket>();
      let totalQty = new Decimal(0);
      let totalRevenue = new Decimal(0);

      for (const it of cmd.items) {
        const qty = new Decimal(it.quantity as string | number);
        if (qty.isNegative() || qty.isZero()) {
          throw new DomainValidationError('Sale item quantity must be > 0', {
            articleId: it.articleId,
            quantity: qty.toFixed(),
          });
        }

        const wh = await this.warehouses.requireById(
          it.warehouseId,
          ctx.organizationId,
          tx,
        );
        if (!wh.isFoh()) {
          throw new DomainValidationError(
            'Smjena se može zatvoriti samo nad FOH skladištima',
            { warehouseId: wh.id, kind: wh.kind },
          );
        }

        const article = await this.articles.requireById(
          it.articleId,
          ctx.organizationId,
          tx,
        );
        const unitPrice = article.salePrice.amount;
        const lineTotal = unitPrice.times(qty);

        let bucket = buckets.get(wh.id);
        if (!bucket) {
          bucket = { warehouseId: wh.id, items: [] };
          buckets.set(wh.id, bucket);
        }
        bucket.items.push({ articleId: article.id, quantity: qty, unitPrice });

        // Decrement stock now — bails out fast if insufficient.
        await this.stock.increment(article.id, wh.id, qty.negated(), tx);

        totalQty = totalQty.plus(qty);
        totalRevenue = totalRevenue.plus(lineTotal);
      }

      const sales: Sale[] = [];
      for (const bucket of buckets.values()) {
        const sale = await this.repo.createSale(
          {
            organizationId: ctx.organizationId,
            shiftId: shift.id,
            warehouseId: bucket.warehouseId,
            createdById: ctx.userId,
            items: bucket.items,
          },
          org.currency,
          tx,
        );
        sales.push(sale);

        await this.auditLog.record(
          {
            organizationId: ctx.organizationId,
            userId: ctx.userId,
            action: AuditAction.SALE_CREATED,
            entityType: 'Sale',
            entityId: sale.id,
            before: null,
            after: sale.toSnapshot(),
          },
          tx,
        );
      }

      shift = await this.repo.closeShift(
        {
          shiftId: shift.id,
          closedById: ctx.userId,
          totalQuantity: totalQty,
          totalRevenueAmount: totalRevenue,
        },
        org.currency,
        tx,
      );

      await this.auditLog.record(
        {
          organizationId: ctx.organizationId,
          userId: ctx.userId,
          action: AuditAction.SHIFT_CLOSED,
          entityType: 'Shift',
          entityId: shift.id,
          before: null,
          after: shift.toSnapshot(),
        },
        tx,
      );

      // Phase 9 — auto-replenish FOH from BOH after the shift is closed.
      // Runs inside the same transaction so an insufficient-source error
      // rolls back the entire shift close. Frontend should pre-validate
      // with /shifts/close/preview and surface options to the user.
      if (cmd.replenish) {
        await this.executeReplenish(
          cmd.replenish,
          Array.from(buckets.values()).map((b) => b.warehouseId),
          ctx,
          tx,
        );
      }

      return { shift, sales };
    });
  }

  /**
   * Dry-run replenish: returns per-FOH delta (target − projectedStock) and
   * the amount available in the user-selected BOH source. No writes.
   *
   * Frontend calls this before actually closing the shift so the confirm
   * modal can show "BOH ima 24, treba 28, prebacit ćemo djelomično".
   */
  async previewShiftReplenish(
    cmd: CloseShiftCommand,
    ctx: AuthContext,
  ): Promise<ReplenishPreview> {
    if (!cmd.replenish) {
      throw new DomainValidationError('Replenish payload is required for preview');
    }
    const replenish = cmd.replenish;

    const source = await this.warehouses.requireById(
      replenish.sourceWarehouseId,
      ctx.organizationId,
    );

    // Group sale items by FOH warehouse so we can simulate post-sales stock.
    const fohIds = new Set<string>();
    const consumedByWh = new Map<string, Map<string, Decimal>>();
    for (const it of cmd.items) {
      const wh = await this.warehouses.requireById(it.warehouseId, ctx.organizationId);
      if (!wh.isFoh()) {
        throw new DomainValidationError(
          'Smjena se može zatvoriti samo nad FOH skladištima',
          { warehouseId: wh.id, kind: wh.kind },
        );
      }
      fohIds.add(wh.id);
      const qty = new Decimal(it.quantity as string | number);
      const inner = consumedByWh.get(wh.id) ?? new Map<string, Decimal>();
      inner.set(it.articleId, (inner.get(it.articleId) ?? new Decimal(0)).plus(qty));
      consumedByWh.set(wh.id, inner);
    }

    const skip = new Set(replenish.skipWarehouseIds ?? []);
    const overridesByWh = new Map<string, Map<string, Decimal>>();
    for (const ov of replenish.overrides ?? []) {
      const inner = overridesByWh.get(ov.warehouseId) ?? new Map<string, Decimal>();
      inner.set(ov.articleId, new Decimal(ov.targetQty as string | number));
      overridesByWh.set(ov.warehouseId, inner);
    }

    // Snapshot source stock — used to compute availability across all FOHs.
    const sourceStockEntries = await this.stock.getByWarehouse(source.id);
    const sourceAvailable = new Map<string, Decimal>();
    for (const entry of sourceStockEntries) {
      sourceAvailable.set(entry.articleId, entry.quantity);
    }

    const warehouses: ReplenishWarehousePreview[] = [];
    for (const fohId of fohIds) {
      if (skip.has(fohId)) continue;
      if (fohId === source.id) continue; // can't replenish from self

      const targets = await this.stockTargets.list(fohId, ctx.organizationId);
      const targetByArticle = new Map(targets.map((t) => [t.articleId, t.targetQty]));
      const overridesForWh = overridesByWh.get(fohId) ?? new Map<string, Decimal>();

      const stockEntries = await this.stock.getByWarehouse(fohId);
      const currentByArticle = new Map(stockEntries.map((e) => [e.articleId, e.quantity]));

      const consumed = consumedByWh.get(fohId) ?? new Map<string, Decimal>();

      // Article ids of interest = union(targets, overrides) — only articles
      // with a configured target (or explicit override) participate.
      const articleIds = new Set<string>([
        ...targetByArticle.keys(),
        ...overridesForWh.keys(),
      ]);

      const items: ReplenishItemPreview[] = [];
      for (const articleId of articleIds) {
        const current = currentByArticle.get(articleId) ?? new Decimal(0);
        const projected = current.minus(consumed.get(articleId) ?? new Decimal(0));
        const override = overridesForWh.get(articleId);
        const targetQty = override ?? targetByArticle.get(articleId);
        if (!targetQty) {
          items.push({
            articleId,
            currentStock: current.toFixed(3),
            projectedStock: projected.toFixed(3),
            targetQty: null,
            delta: '0',
            availableInSource: (sourceAvailable.get(articleId) ?? new Decimal(0)).toFixed(3),
            willTransferQty: '0',
            status: 'no_target',
            overridden: !!override,
          });
          continue;
        }
        const rawDelta = targetQty.minus(projected);
        const delta = rawDelta.isPositive() ? rawDelta : new Decimal(0);
        const available = sourceAvailable.get(articleId) ?? new Decimal(0);
        const willTransfer = Decimal.min(delta, available);

        let status: ReplenishItemStatus = 'ok';
        if (delta.isZero()) status = 'ok';
        else if (available.isZero()) status = 'insufficient';
        else if (willTransfer.lessThan(delta)) status = 'partial';

        items.push({
          articleId,
          currentStock: current.toFixed(3),
          projectedStock: projected.toFixed(3),
          targetQty: targetQty.toFixed(3),
          delta: delta.toFixed(3),
          availableInSource: available.toFixed(3),
          willTransferQty: willTransfer.toFixed(3),
          status,
          overridden: !!override,
        });

        // Subtract from running source availability so multiple FOHs don't
        // double-count the same source stock.
        if (willTransfer.isPositive()) {
          sourceAvailable.set(articleId, available.minus(willTransfer));
        }
      }

      warehouses.push({ warehouseId: fohId, items });
    }

    return { sourceWarehouseId: source.id, warehouses };
  }

  /**
   * Runs the replenish portion inside an existing transaction (called by
   * closeShift after sales/stock decrements have been written). Computes
   * the same delta as `previewShiftReplenish`, then opens one StockTransfer
   * per FOH using `TransfersService.create` with the shared tx.
   *
   * `fohWarehouseIds` is the set of warehouses that participated in the
   * shift — replenish only touches those.
   */
  private async executeReplenish(
    replenish: ReplenishCommand,
    fohWarehouseIds: string[],
    ctx: AuthContext,
    tx: TxClient,
  ): Promise<void> {
    const source = await this.warehouses.requireById(
      replenish.sourceWarehouseId,
      ctx.organizationId,
      tx,
    );

    const skip = new Set(replenish.skipWarehouseIds ?? []);
    const overridesByWh = new Map<string, Map<string, Decimal>>();
    for (const ov of replenish.overrides ?? []) {
      const inner = overridesByWh.get(ov.warehouseId) ?? new Map<string, Decimal>();
      inner.set(ov.articleId, new Decimal(ov.targetQty as string | number));
      overridesByWh.set(ov.warehouseId, inner);
    }

    const sourceEntries = await this.stock.getByWarehouse(source.id, tx);
    const sourceAvailable = new Map<string, Decimal>();
    for (const e of sourceEntries) sourceAvailable.set(e.articleId, e.quantity);

    for (const fohId of fohWarehouseIds) {
      if (skip.has(fohId)) continue;
      if (fohId === source.id) continue;

      const targets = await this.stockTargets.list(fohId, ctx.organizationId, tx);
      const targetByArticle = new Map(targets.map((t) => [t.articleId, t.targetQty]));
      const overridesForWh = overridesByWh.get(fohId) ?? new Map<string, Decimal>();

      const fohEntries = await this.stock.getByWarehouse(fohId, tx);
      const currentByArticle = new Map(fohEntries.map((e) => [e.articleId, e.quantity]));

      const articleIds = new Set<string>([
        ...targetByArticle.keys(),
        ...overridesForWh.keys(),
      ]);

      const transferItems: Array<{ articleId: string; quantity: Decimal }> = [];
      for (const articleId of articleIds) {
        const current = currentByArticle.get(articleId) ?? new Decimal(0);
        const override = overridesForWh.get(articleId);
        const targetQty = override ?? targetByArticle.get(articleId);
        if (!targetQty) continue;
        const rawDelta = targetQty.minus(current);
        const delta = rawDelta.isPositive() ? rawDelta : new Decimal(0);
        if (delta.isZero()) continue;
        const available = sourceAvailable.get(articleId) ?? new Decimal(0);
        const willTransfer = Decimal.min(delta, available);
        if (willTransfer.isZero()) continue;
        transferItems.push({ articleId, quantity: willTransfer });
        sourceAvailable.set(articleId, available.minus(willTransfer));
      }

      if (transferItems.length === 0) continue;

      await this.transfers.create(
        {
          sourceWarehouseId: source.id,
          destinationWarehouseId: fohId,
          note: 'Auto-replenish nakon zatvaranja smjene',
          items: transferItems,
        },
        ctx,
        tx,
      );
    }
  }

  async findShiftById(
    id: string,
    organizationId: string,
    tx?: TxClient,
  ): Promise<ShiftWithSales> {
    const org = await this.orgs.requireById(organizationId, tx);
    const found = await this.repo.findShiftWithSales(id, org.currency, tx);
    if (!found) throw new EntityNotFoundError('Shift', id);
    if (found.shift.organizationId !== organizationId) {
      throw new CrossOrgAccessError('Shift', id);
    }
    return found;
  }

  async listShifts(
    filter: Omit<ListShiftsFilter, 'organizationId'> & { organizationId: string },
    tx?: TxClient,
  ): Promise<PaginatedShifts> {
    const org = await this.orgs.requireById(filter.organizationId, tx);
    return this.repo.listShifts(filter, org.currency, tx);
  }

  async deleteShift(
    id: string,
    organizationId: string,
    ctx: AuthContext,
    tx?: TxClient,
  ): Promise<void> {
    const found = await this.repo.findShiftById(id, 'EUR', tx);
    if (!found) throw new EntityNotFoundError('Shift', id);
    if (found.organizationId !== organizationId) {
      throw new CrossOrgAccessError('Shift', id);
    }
    await this.repo.deleteShift(id, tx);
    await this.auditLog.record(
      {
        organizationId: ctx.organizationId,
        userId: ctx.userId,
        action: AuditAction.SHIFT_CLOSED,
        entityType: 'Shift',
        entityId: id,
        before: found.toSnapshot(),
        after: null,
      },
      tx,
    );
  }
}

function todayUtcMidnight(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}
