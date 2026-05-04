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
import { StockService } from '../stock/stock.service';
import { WarehousesService } from '../warehouses/warehouses.service';
import { PrismaService } from '../../data/common/prisma/prisma.service';
import { StockTransfer } from './stock-transfer.domain';
import {
  ListTransfersFilter,
  PaginatedTransfers,
  TransfersRepository,
} from './transfers.repository';

export interface CreateTransferItemCommand {
  articleId: string;
  quantity: string | number | Decimal;
}

export interface CreateTransferCommand {
  sourceWarehouseId: string;
  destinationWarehouseId: string;
  note?: string;
  items: CreateTransferItemCommand[];
}

@Injectable()
export class TransfersService {
  constructor(
    private readonly repo: TransfersRepository,
    private readonly warehouses: WarehousesService,
    private readonly articles: ArticlesService,
    private readonly stock: StockService,
    private readonly auditLog: AuditLogService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Atomic transfer creation. Inside one transaction:
   *   1. Validate source ≠ destination + both warehouses belong to the org.
   *   2. Validate every articleId belongs to the org.
   *   3. Decrement stock at source (StockService rejects negative outcomes).
   *   4. Increment stock at destination.
   *   5. Insert StockTransfer + StockTransferItem rows.
   *   6. Record audit log.
   */
  async create(
    cmd: CreateTransferCommand,
    ctx: AuthContext,
  ): Promise<StockTransfer> {
    if (!cmd.items?.length) {
      throw new DomainValidationError('At least one item is required');
    }
    if (cmd.sourceWarehouseId === cmd.destinationWarehouseId) {
      throw new DomainValidationError(
        'Source and destination warehouse must differ',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await this.warehouses.requireById(
        cmd.sourceWarehouseId,
        ctx.organizationId,
        tx,
      );
      await this.warehouses.requireById(
        cmd.destinationWarehouseId,
        ctx.organizationId,
        tx,
      );
      for (const item of cmd.items) {
        await this.articles.requireById(item.articleId, ctx.organizationId, tx);
      }

      // Aggregate same article entries (defensive — UI shouldn't allow it)
      const aggregated = new Map<string, Decimal>();
      for (const it of cmd.items) {
        const qty = new Decimal(it.quantity as string | number);
        if (qty.isNegative() || qty.isZero()) {
          throw new DomainValidationError(
            'Transfer item quantity must be > 0',
            { articleId: it.articleId, quantity: qty.toFixed() },
          );
        }
        aggregated.set(
          it.articleId,
          (aggregated.get(it.articleId) ?? new Decimal(0)).plus(qty),
        );
      }

      // Move stock — source decrement first so it fails fast on insufficient stock.
      for (const [articleId, qty] of aggregated.entries()) {
        await this.stock.increment(articleId, cmd.sourceWarehouseId, qty.negated(), tx);
        await this.stock.increment(articleId, cmd.destinationWarehouseId, qty, tx);
      }

      const created = await this.repo.create(
        {
          organizationId: ctx.organizationId,
          sourceWarehouseId: cmd.sourceWarehouseId,
          destinationWarehouseId: cmd.destinationWarehouseId,
          createdById: ctx.userId,
          note: cmd.note ?? null,
          items: Array.from(aggregated.entries()).map(([articleId, quantity]) => ({
            articleId,
            quantity,
          })),
        },
        tx,
      );

      await this.auditLog.record(
        {
          organizationId: ctx.organizationId,
          userId: ctx.userId,
          action: AuditAction.TRANSFER_CREATED,
          entityType: 'StockTransfer',
          entityId: created.id,
          before: null,
          after: created.toSnapshot(),
        },
        tx,
      );

      return created;
    });
  }

  async findById(
    id: string,
    organizationId: string,
    tx?: TxClient,
  ): Promise<StockTransfer> {
    const t = await this.repo.findById(id, tx);
    if (!t) throw new EntityNotFoundError('StockTransfer', id);
    if (t.organizationId !== organizationId) {
      throw new CrossOrgAccessError('StockTransfer', id);
    }
    return t;
  }

  async list(
    filter: Omit<ListTransfersFilter, 'organizationId'> & { organizationId: string },
    tx?: TxClient,
  ): Promise<PaginatedTransfers> {
    return this.repo.list(filter, tx);
  }
}
