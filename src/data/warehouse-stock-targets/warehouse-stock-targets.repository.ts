import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TxClient } from '../../domain/common/transaction';
import { WarehouseStockTarget } from '../../domain/warehouse-stock-targets/warehouse-stock-target.domain';
import {
  UpsertTargetInput,
  WarehouseStockTargetsRepository,
} from '../../domain/warehouse-stock-targets/warehouse-stock-targets.repository';
import { PrismaService } from '../common/prisma/prisma.service';
import { WarehouseStockTargetsMapper } from './warehouse-stock-targets.mapper';

@Injectable()
export class PrismaWarehouseStockTargetsRepository extends WarehouseStockTargetsRepository {
  private readonly mapper = new WarehouseStockTargetsMapper();

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  private client(tx?: TxClient): Prisma.TransactionClient | PrismaService {
    return tx ?? this.prisma;
  }

  async listByWarehouse(
    warehouseId: string,
    tx?: TxClient,
  ): Promise<WarehouseStockTarget[]> {
    const rows = await this.client(tx).warehouseStockTarget.findMany({
      where: { warehouseId },
      orderBy: { articleId: 'asc' },
    });
    return rows.map((r) => this.mapper.toDomain(r));
  }

  async findOne(
    warehouseId: string,
    articleId: string,
    tx?: TxClient,
  ): Promise<WarehouseStockTarget | null> {
    const row = await this.client(tx).warehouseStockTarget.findUnique({
      where: { warehouseId_articleId: { warehouseId, articleId } },
    });
    return row ? this.mapper.toDomain(row) : null;
  }

  async upsert(input: UpsertTargetInput, tx?: TxClient): Promise<WarehouseStockTarget> {
    const row = await this.client(tx).warehouseStockTarget.upsert({
      where: {
        warehouseId_articleId: {
          warehouseId: input.warehouseId,
          articleId: input.articleId,
        },
      },
      create: {
        warehouseId: input.warehouseId,
        articleId: input.articleId,
        targetQty: input.targetQty.toFixed(3),
      },
      update: { targetQty: input.targetQty.toFixed(3) },
    });
    return this.mapper.toDomain(row);
  }

  async delete(warehouseId: string, articleId: string, tx?: TxClient): Promise<void> {
    await this.client(tx).warehouseStockTarget.deleteMany({
      where: { warehouseId, articleId },
    });
  }
}
