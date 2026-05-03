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
import {
  CorrectionReason,
  CorrectionType,
  StockCorrection,
} from './correction.domain';
import {
  CorrectionsRepository,
  ListCorrectionsFilter,
  PaginatedCorrections,
} from './corrections.repository';

export interface CreateCorrectionCommand {
  articleId: string;
  warehouseId: string;
  type: CorrectionType;
  value: string | number | Decimal;
  reason: CorrectionReason;
  note?: string;
}

@Injectable()
export class CorrectionsService {
  constructor(
    private readonly repo: CorrectionsRepository,
    private readonly orgs: OrganizationsService,
    private readonly articles: ArticlesService,
    private readonly warehouses: WarehousesService,
    private readonly stock: StockService,
    private readonly auditLog: AuditLogService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Atomic correction creation. Inside one transaction:
   *   1. Validate org + article + warehouse all belong together
   *   2. Read current stock so audit can capture the before-snapshot
   *   3. Compute the new quantity (ABSOLUTE → set, DELTA → increment)
   *   4. Apply via StockService (which throws if it would go negative)
   *   5. Insert StockCorrection row
   *   6. Record audit log with before/after snapshots
   */
  async create(
    cmd: CreateCorrectionCommand,
    ctx: AuthContext,
  ): Promise<StockCorrection> {
    return this.prisma.$transaction(async (tx) => {
      await this.orgs.requireById(ctx.organizationId, tx);
      await this.articles.requireById(cmd.articleId, ctx.organizationId, tx);
      await this.warehouses.requireById(cmd.warehouseId, ctx.organizationId, tx);

      const value = new Decimal(cmd.value as string | number);

      // Domain invariants are enforced when constructing the entity. We
      // build it now so we can call applyTo() with the current stock.
      const tempCorrection = new StockCorrection(
        'pending',
        ctx.organizationId,
        cmd.articleId,
        cmd.warehouseId,
        cmd.type,
        value,
        cmd.reason,
        cmd.note ?? null,
        ctx.userId,
        new Date(),
      );

      const existing = await this.stock.getByArticleAndWarehouse(
        cmd.articleId,
        cmd.warehouseId,
        tx,
      );
      const currentQty = existing?.quantity ?? new Decimal(0);
      const nextQty = tempCorrection.applyTo(currentQty);

      if (nextQty.isNegative()) {
        throw new DomainValidationError(
          `Stock would go negative (${currentQty.toFixed()} → ${nextQty.toFixed()})`,
          {
            articleId: cmd.articleId,
            warehouseId: cmd.warehouseId,
            current: currentQty.toFixed(),
            attempted: nextQty.toFixed(),
          },
        );
      }

      // Persist the correction first so the audit entry can carry its id.
      const created = await this.repo.create(
        {
          organizationId: ctx.organizationId,
          articleId: cmd.articleId,
          warehouseId: cmd.warehouseId,
          type: cmd.type,
          value,
          reason: cmd.reason,
          note: cmd.note ?? null,
          createdById: ctx.userId,
        },
        tx,
      );

      // Apply the stock mutation via StockService.
      if (cmd.type === CorrectionType.ABSOLUTE) {
        await this.stock.setQuantity(
          cmd.articleId,
          cmd.warehouseId,
          nextQty,
          tx,
        );
      } else {
        await this.stock.increment(cmd.articleId, cmd.warehouseId, value, tx);
      }

      await this.auditLog.record(
        {
          organizationId: ctx.organizationId,
          userId: ctx.userId,
          action: AuditAction.CORRECTION_CREATED,
          entityType: 'StockCorrection',
          entityId: created.id,
          before: {
            articleId: cmd.articleId,
            warehouseId: cmd.warehouseId,
            qty: currentQty.toFixed(3),
          },
          after: {
            articleId: cmd.articleId,
            warehouseId: cmd.warehouseId,
            qty: nextQty.toFixed(3),
            correction: created.toSnapshot(),
          },
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
  ): Promise<StockCorrection> {
    const c = await this.repo.findById(id, tx);
    if (!c) throw new EntityNotFoundError('StockCorrection', id);
    if (c.organizationId !== organizationId) {
      throw new CrossOrgAccessError('StockCorrection', id);
    }
    return c;
  }

  async list(
    filter: Omit<ListCorrectionsFilter, 'organizationId'> & {
      organizationId: string;
    },
    tx?: TxClient,
  ): Promise<PaginatedCorrections> {
    return this.repo.list(filter, tx);
  }
}
