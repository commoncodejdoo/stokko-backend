import { Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { PrismaService } from '../../data/common/prisma/prisma.service';
import { ArticlesService } from '../articles/articles.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AuditAction } from '../common/audit-action';
import { AuthContext } from '../common/auth-context';
import { DomainValidationError } from '../common/errors';
import { TxClient } from '../common/transaction';
import { WarehousesService } from '../warehouses/warehouses.service';
import { WarehouseStockTarget } from './warehouse-stock-target.domain';
import {
  UpsertTargetInput,
  WarehouseStockTargetsRepository,
} from './warehouse-stock-targets.repository';

export interface ReplaceTargetsItem {
  articleId: string;
  targetQty: string | number | Decimal;
}

@Injectable()
export class WarehouseStockTargetsService {
  constructor(
    private readonly repo: WarehouseStockTargetsRepository,
    private readonly warehouses: WarehousesService,
    private readonly articles: ArticlesService,
    private readonly auditLog: AuditLogService,
    private readonly prisma: PrismaService,
  ) {}

  async list(
    warehouseId: string,
    organizationId: string,
    tx?: TxClient,
  ): Promise<WarehouseStockTarget[]> {
    await this.warehouses.requireById(warehouseId, organizationId, tx);
    return this.repo.listByWarehouse(warehouseId, tx);
  }

  /**
   * Replaces the entire target set for one warehouse. Items with targetQty=0
   * are removed (rather than persisted as a zero row) to keep the table
   * sparse — clients can simply omit articles they don't care about.
   */
  async replaceForWarehouse(
    warehouseId: string,
    items: ReplaceTargetsItem[],
    ctx: AuthContext,
  ): Promise<WarehouseStockTarget[]> {
    const warehouse = await this.warehouses.requireById(warehouseId, ctx.organizationId);
    if (!warehouse.isFoh()) {
      throw new DomainValidationError(
        'Optimalno stanje se može postaviti samo za FOH skladišta',
        { warehouseId, kind: warehouse.kind },
      );
    }

    for (const it of items) {
      await this.articles.requireById(it.articleId, ctx.organizationId);
    }

    return this.prisma.$transaction(async (tx) => {
      const current = await this.repo.listByWarehouse(warehouseId, tx);
      const currentByArticle = new Map(current.map((t) => [t.articleId, t]));
      const wanted: UpsertTargetInput[] = [];
      for (const it of items) {
        const qty = new Decimal(it.targetQty as string | number);
        if (qty.isPositive()) {
          wanted.push({ warehouseId, articleId: it.articleId, targetQty: qty });
        }
      }
      const wantedSet = new Set(wanted.map((w) => w.articleId));

      const before = current.map((t) => t.toSnapshot());

      for (const item of wanted) {
        await this.repo.upsert(item, tx);
      }
      for (const c of current) {
        if (!wantedSet.has(c.articleId)) {
          await this.repo.delete(warehouseId, c.articleId, tx);
        }
      }

      const updated = await this.repo.listByWarehouse(warehouseId, tx);
      const after = updated.map((t) => t.toSnapshot());

      await this.auditLog.record(
        {
          organizationId: ctx.organizationId,
          userId: ctx.userId,
          action: AuditAction.WAREHOUSE_STOCK_TARGET_UPDATED,
          entityType: 'Warehouse',
          entityId: warehouseId,
          before: { items: before },
          after: { items: after },
        },
        tx,
      );

      return updated;
    });
  }
}
