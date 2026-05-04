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
import { WarehousesService } from '../warehouses/warehouses.service';
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

export interface CloseShiftCommand {
  items: CloseShiftItemCommand[];
}

@Injectable()
export class SalesService {
  constructor(
    private readonly repo: SalesRepository,
    private readonly orgs: OrganizationsService,
    private readonly warehouses: WarehousesService,
    private readonly articles: ArticlesService,
    private readonly stock: StockService,
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

      return { shift, sales };
    });
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
