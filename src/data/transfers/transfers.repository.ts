import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TxClient } from '../../domain/common/transaction';
import { StockTransfer } from '../../domain/transfers/stock-transfer.domain';
import {
  CreateTransferInput,
  ListTransfersFilter,
  PaginatedTransfers,
  TransfersRepository,
} from '../../domain/transfers/transfers.repository';
import { PrismaService } from '../common/prisma/prisma.service';
import { TransfersMapper } from './transfers.mapper';

@Injectable()
export class PrismaTransfersRepository extends TransfersRepository {
  private readonly mapper = new TransfersMapper();

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  private client(tx?: TxClient): Prisma.TransactionClient | PrismaService {
    return tx ?? this.prisma;
  }

  async create(input: CreateTransferInput, tx?: TxClient): Promise<StockTransfer> {
    const row = await this.client(tx).stockTransfer.create({
      data: {
        organizationId: input.organizationId,
        sourceWarehouseId: input.sourceWarehouseId,
        destinationWarehouseId: input.destinationWarehouseId,
        createdById: input.createdById,
        note: input.note ?? null,
        items: {
          create: input.items.map((i) => ({
            articleId: i.articleId,
            quantity: new Prisma.Decimal(i.quantity.toFixed()),
          })),
        },
      },
      include: { items: true },
    });
    return this.mapper.toDomain(row);
  }

  async findById(id: string, tx?: TxClient): Promise<StockTransfer | null> {
    const row = await this.client(tx).stockTransfer.findUnique({
      where: { id },
      include: { items: true },
    });
    return row ? this.mapper.toDomain(row) : null;
  }

  async list(
    filter: ListTransfersFilter,
    tx?: TxClient,
  ): Promise<PaginatedTransfers> {
    const where: Prisma.StockTransferWhereInput = {
      organizationId: filter.organizationId,
    };
    if (filter.warehouseId) {
      where.OR = [
        { sourceWarehouseId: filter.warehouseId },
        { destinationWarehouseId: filter.warehouseId },
      ];
    }

    const page = filter.page ?? 1;
    const pageSize = filter.pageSize ?? 50;
    const client = this.client(tx);

    const [rows, total] = await Promise.all([
      client.stockTransfer.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { items: true },
      }),
      client.stockTransfer.count({ where }),
    ]);

    return {
      items: rows.map((r) => this.mapper.toDomain(r)),
      total,
    };
  }
}
