import { Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { ArticlesService } from '../articles/articles.service';
import { Article } from '../articles/article.domain';
import { AuditLogEntry } from '../audit-log/audit-log.domain';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AuditAction } from '../common/audit-action';
import { computeStockStatus, StockStatus } from '../common/stock-status';
import { OrganizationsService } from '../organizations/organizations.service';
import { ProcurementsService } from '../procurements/procurements.service';
import { StockEntry } from '../stock/stock-entry.domain';
import { StockService } from '../stock/stock.service';
import { UsersService } from '../users/users.service';
import { WarehousesService } from '../warehouses/warehouses.service';

export interface DashboardCounts {
  warehouses: number;
  articles: number;
  /** Articles whose overall stock status is WARNING or CRITICAL. */
  lowStockCount: number;
  /** Procurements created today (org timezone = UTC for MVP). */
  todayProcurementsCount: number;
}

export interface DashboardWarehouseStat {
  warehouseId: string;
  name: string;
  color: string;
  initials: string;
  /** Number of distinct articles with a non-zero stock entry. */
  articleCount: number;
  /** Sum of all stock quantities. */
  totalQuantity: Decimal;
  /** Sum of qty × purchasePrice across this warehouse's stock. */
  totalValue: Decimal;
  currency: string;
}

export interface DashboardActivityActor {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  initials: string;
}

export interface DashboardActivityEntry {
  id: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  user: DashboardActivityActor | null;
  before: unknown;
  after: unknown;
  createdAt: Date;
}

export interface DashboardOverview {
  counts: DashboardCounts;
  perWarehouse: DashboardWarehouseStat[];
  recentActivity: DashboardActivityEntry[];
}

const ACTIVITY_LIMIT = 10;

/**
 * Audit actions hidden from the activity feed — they're either pure noise
 * (logins fire on every refresh) or aren't user-initiated state changes.
 */
const ACTIVITY_HIDDEN_ACTIONS = new Set<AuditAction>([AuditAction.USER_LOGGED_IN]);

@Injectable()
export class DashboardService {
  constructor(
    private readonly orgs: OrganizationsService,
    private readonly warehouses: WarehousesService,
    private readonly articles: ArticlesService,
    private readonly stock: StockService,
    private readonly procurements: ProcurementsService,
    private readonly auditLog: AuditLogService,
    private readonly users: UsersService,
  ) {}

  async getOverview(organizationId: string): Promise<DashboardOverview> {
    const org = await this.orgs.requireById(organizationId);
    const currency = org.currency;

    const [warehouses, articles] = await Promise.all([
      this.warehouses.list(organizationId),
      this.articles.list({ organizationId }),
    ]);

    // Stock per warehouse — one query per warehouse keeps things simple in
    // MVP; for orgs with hundreds of warehouses we'd switch to a single
    // joined query.
    const stockByWarehouse = new Map<string, StockEntry[]>();
    for (const w of warehouses) {
      stockByWarehouse.set(w.id, await this.stock.getByWarehouse(w.id));
    }

    // Stock per article — same shape but indexed by articleId, used for
    // the lowStockCount calculation.
    const stockByArticle = new Map<string, StockEntry[]>();
    for (const w of warehouses) {
      for (const e of stockByWarehouse.get(w.id) ?? []) {
        const list = stockByArticle.get(e.articleId) ?? [];
        list.push(e);
        stockByArticle.set(e.articleId, list);
      }
    }

    const articleById = new Map<string, Article>();
    for (const a of articles) articleById.set(a.id, a);

    const perWarehouse: DashboardWarehouseStat[] = warehouses.map((w) => {
      const entries = stockByWarehouse.get(w.id) ?? [];
      let totalQty = new Decimal(0);
      let totalValue = new Decimal(0);
      let articleCount = 0;
      for (const e of entries) {
        if (e.quantity.isZero()) continue;
        articleCount += 1;
        totalQty = totalQty.plus(e.quantity);
        const a = articleById.get(e.articleId);
        if (a) {
          totalValue = totalValue.plus(e.quantity.times(a.purchasePrice.amount));
        }
      }
      return {
        warehouseId: w.id,
        name: w.name,
        color: w.color,
        initials: w.initials(),
        articleCount,
        totalQuantity: totalQty,
        totalValue,
        currency,
      };
    });

    const lowStockCount = articles.reduce((acc, a) => {
      const overall = computeOverallStatus(a, stockByArticle.get(a.id) ?? []);
      return overall === StockStatus.WARNING || overall === StockStatus.CRITICAL
        ? acc + 1
        : acc;
    }, 0);

    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayProcurementsCount = await this.procurements.countCreatedSince(
      organizationId,
      todayStart,
    );

    const counts: DashboardCounts = {
      warehouses: warehouses.length,
      articles: articles.length,
      lowStockCount,
      todayProcurementsCount,
    };

    const recentActivity = await this.buildRecentActivity(organizationId);

    return { counts, perWarehouse, recentActivity };
  }

  private async buildRecentActivity(
    organizationId: string,
  ): Promise<DashboardActivityEntry[]> {
    // Over-fetch so the post-filter result still has up to ACTIVITY_LIMIT rows.
    const raw = await this.auditLog.listRecent(organizationId, ACTIVITY_LIMIT * 5);
    const entries = raw
      .filter((e) => !ACTIVITY_HIDDEN_ACTIONS.has(e.action))
      .slice(0, ACTIVITY_LIMIT);
    if (entries.length === 0) return [];

    const userIds = new Set(entries.map((e) => e.userId));
    const users = await this.users.listByOrg(organizationId);
    const userById = new Map(
      users.filter((u) => userIds.has(u.id)).map((u) => [u.id, u]),
    );

    return entries.map((e: AuditLogEntry) => {
      const u = userById.get(e.userId);
      return {
        id: e.id,
        action: e.action,
        entityType: e.entityType,
        entityId: e.entityId,
        user: u
          ? {
              id: u.id,
              firstName: u.firstName,
              lastName: u.lastName,
              fullName: u.fullName(),
              initials: u.initials(),
            }
          : null,
        before: e.before,
        after: e.after,
        createdAt: e.createdAt,
      };
    });
  }
}

function computeOverallStatus(article: Article, entries: StockEntry[]): StockStatus {
  if (entries.length === 0) return StockStatus.UNKNOWN;
  let worst = StockStatus.OK;
  for (const e of entries) {
    const s = computeStockStatus(
      e.quantity,
      article.thresholdWarning,
      article.thresholdCritical,
    );
    if (s === StockStatus.CRITICAL) return StockStatus.CRITICAL;
    if (s === StockStatus.WARNING) worst = StockStatus.WARNING;
  }
  return worst;
}
