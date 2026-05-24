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
import { SuppliersService } from '../suppliers/suppliers.service';
import { WarehousesService } from '../warehouses/warehouses.service';
import { PrismaService } from '../../data/common/prisma/prisma.service';
import { Procurement } from './procurement.domain';
import {
  ListProcurementsFilter,
  PaginatedProcurements,
  ProcurementsRepository,
} from './procurements.repository';

export interface CreateProcurementItemCommand {
  articleId: string;
  quantity: string | number | Decimal;
  /**
   * Override of the article's default purchase price (per unit).
   * Optional when the org's `priceTrackingEnabled` flag is false; defaults to 0.
   */
  purchasePrice?: string | number | Decimal;
}

function isPriceMissing(v: string | number | Decimal | undefined): boolean {
  if (v === undefined || v === null) return true;
  if (typeof v === 'string' && v.trim() === '') return true;
  return false;
}

export interface CreateProcurementCommand {
  supplierId?: string | null;
  warehouseId: string;
  note?: string;
  items: CreateProcurementItemCommand[];
}

@Injectable()
export class ProcurementsService {
  constructor(
    private readonly repo: ProcurementsRepository,
    private readonly orgs: OrganizationsService,
    private readonly suppliers: SuppliersService,
    private readonly warehouses: WarehousesService,
    private readonly articles: ArticlesService,
    private readonly stock: StockService,
    private readonly auditLog: AuditLogService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Atomic procurement creation. Inside one transaction:
   *   1. Validate supplier + warehouse + every articleId belongs to the org
   *   2. Insert Procurement + ProcurementItem rows
   *   3. Increment stock per (article, warehouse)
   *   4. Record audit log
   *
   * Any failure rolls everything back — including the audit log.
   */
  async create(
    cmd: CreateProcurementCommand,
    ctx: AuthContext,
  ): Promise<Procurement> {
    if (!cmd.items?.length) {
      throw new DomainValidationError('At least one item is required');
    }

    return this.prisma.$transaction(async (tx) => {
      const org = await this.orgs.requireById(ctx.organizationId, tx);

      if (org.priceTrackingEnabled) {
        for (const item of cmd.items) {
          if (isPriceMissing(item.purchasePrice)) {
            throw new DomainValidationError(
              'Nabavna cijena po stavci je obavezna dok je praćenje cijena uključeno',
            );
          }
        }
      }

      // Validate FKs.
      const supplierId = cmd.supplierId ?? null;
      if (supplierId) {
        await this.suppliers.requireById(supplierId, ctx.organizationId, tx);
      }
      await this.warehouses.requireById(cmd.warehouseId, ctx.organizationId, tx);
      for (const item of cmd.items) {
        await this.articles.requireById(item.articleId, ctx.organizationId, tx);
      }

      const created = await this.repo.create(
        {
          organizationId: ctx.organizationId,
          supplierId,
          warehouseId: cmd.warehouseId,
          createdById: ctx.userId,
          note: cmd.note ?? null,
          items: cmd.items.map((i) => ({
            articleId: i.articleId,
            quantity: new Decimal(i.quantity as string | number),
            purchasePrice: isPriceMissing(i.purchasePrice)
              ? new Decimal(0)
              : new Decimal(i.purchasePrice as string | number),
          })),
        },
        org.currency,
        tx,
      );

      // Increment stock per item.
      for (const item of created.items) {
        await this.stock.increment(
          item.articleId,
          created.warehouseId,
          item.quantity,
          tx,
        );
      }

      await this.auditLog.record(
        {
          organizationId: ctx.organizationId,
          userId: ctx.userId,
          action: AuditAction.PROCUREMENT_CREATED,
          entityType: 'Procurement',
          entityId: created.id,
          before: null,
          after: created.toSnapshot(),
        },
        tx,
      );

      return created;
    });
  }

  async findById(id: string, organizationId: string, tx?: TxClient): Promise<Procurement> {
    const org = await this.orgs.requireById(organizationId, tx);
    const p = await this.repo.findById(id, org.currency, tx);
    if (!p) throw new EntityNotFoundError('Procurement', id);
    if (p.organizationId !== organizationId) {
      throw new CrossOrgAccessError('Procurement', id);
    }
    return p;
  }

  async list(
    filter: Omit<ListProcurementsFilter, 'organizationId'> & { organizationId: string },
    tx?: TxClient,
  ): Promise<PaginatedProcurements> {
    const org = await this.orgs.requireById(filter.organizationId, tx);
    return this.repo.list(filter, org.currency, tx);
  }

  async countCreatedSince(
    organizationId: string,
    since: Date,
    tx?: TxClient,
  ): Promise<number> {
    return this.repo.countCreatedSince(organizationId, since, tx);
  }
}
