import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { StockCorrection } from '../../domain/corrections/correction.domain';
import {
  CorrectionsRepository,
  CreateCorrectionInput,
  ListCorrectionsFilter,
  PaginatedCorrections,
} from '../../domain/corrections/corrections.repository';
import { TxClient } from '../../domain/common/transaction';
import { PrismaService } from '../common/prisma/prisma.service';
import { CorrectionsMapper } from './corrections.mapper';

@Injectable()
export class PrismaCorrectionsRepository extends CorrectionsRepository {
  private readonly mapper = new CorrectionsMapper();

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  private client(tx?: TxClient): Prisma.TransactionClient | PrismaService {
    return tx ?? this.prisma;
  }

  async create(
    input: CreateCorrectionInput,
    tx?: TxClient,
  ): Promise<StockCorrection> {
    const row = await this.client(tx).stockCorrection.create({
      data: {
        organizationId: input.organizationId,
        articleId: input.articleId,
        warehouseId: input.warehouseId,
        type: input.type,
        value: new Prisma.Decimal(input.value.toFixed()),
        reason: input.reason,
        note: input.note ?? null,
        createdById: input.createdById,
      },
    });
    return this.mapper.toDomain(row);
  }

  async findById(id: string, tx?: TxClient): Promise<StockCorrection | null> {
    const row = await this.client(tx).stockCorrection.findUnique({
      where: { id },
    });
    return row ? this.mapper.toDomain(row) : null;
  }

  async list(
    filter: ListCorrectionsFilter,
    tx?: TxClient,
  ): Promise<PaginatedCorrections> {
    const where: Prisma.StockCorrectionWhereInput = {
      organizationId: filter.organizationId,
    };
    if (filter.articleId) where.articleId = filter.articleId;
    if (filter.warehouseId) where.warehouseId = filter.warehouseId;

    const page = filter.page ?? 1;
    const pageSize = filter.pageSize ?? 50;
    const client = this.client(tx);

    const [rows, total] = await Promise.all([
      client.stockCorrection.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      client.stockCorrection.count({ where }),
    ]);

    return {
      items: rows.map((r) => this.mapper.toDomain(r)),
      total,
    };
  }
}
