import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TxClient } from '../../domain/common/transaction';
import { Procurement } from '../../domain/procurements/procurement.domain';
import {
  CreateProcurementInput,
  ListProcurementsFilter,
  PaginatedProcurements,
  ProcurementsRepository,
} from '../../domain/procurements/procurements.repository';
import { PrismaService } from '../common/prisma/prisma.service';
import { ProcurementsMapper } from './procurements.mapper';

@Injectable()
export class PrismaProcurementsRepository extends ProcurementsRepository {
  private readonly mapper = new ProcurementsMapper();

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  private client(tx?: TxClient): Prisma.TransactionClient | PrismaService {
    return tx ?? this.prisma;
  }

  async create(
    input: CreateProcurementInput,
    currency: string,
    tx?: TxClient,
  ): Promise<Procurement> {
    const row = await this.client(tx).procurement.create({
      data: {
        organizationId: input.organizationId,
        supplierId: input.supplierId ?? null,
        warehouseId: input.warehouseId,
        createdById: input.createdById,
        note: input.note ?? null,
        items: {
          create: input.items.map((i) => ({
            articleId: i.articleId,
            quantity: new Prisma.Decimal(i.quantity.toFixed()),
            purchasePrice: new Prisma.Decimal(i.purchasePrice.toFixed()),
          })),
        },
      },
      include: { items: true },
    });
    return this.mapper.toDomain(row, currency);
  }

  async findById(id: string, currency: string, tx?: TxClient): Promise<Procurement | null> {
    const row = await this.client(tx).procurement.findUnique({
      where: { id },
      include: { items: true },
    });
    return row ? this.mapper.toDomain(row, currency) : null;
  }

  async countCreatedSince(
    organizationId: string,
    since: Date,
    tx?: TxClient,
  ): Promise<number> {
    return this.client(tx).procurement.count({
      where: { organizationId, createdAt: { gte: since } },
    });
  }

  async list(
    filter: ListProcurementsFilter,
    currency: string,
    tx?: TxClient,
  ): Promise<PaginatedProcurements> {
    const where: Prisma.ProcurementWhereInput = {
      organizationId: filter.organizationId,
    };
    if (filter.supplierId) where.supplierId = filter.supplierId;
    if (filter.warehouseId) where.warehouseId = filter.warehouseId;
    if (filter.createdSince) where.createdAt = { gte: filter.createdSince };

    const page = filter.page ?? 1;
    const pageSize = filter.pageSize ?? 50;
    const client = this.client(tx);

    const [rows, total] = await Promise.all([
      client.procurement.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { items: true },
      }),
      client.procurement.count({ where }),
    ]);

    return {
      items: rows.map((r) => this.mapper.toDomain(r, currency)),
      total,
    };
  }
}
