import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Decimal } from 'decimal.js';
import { DomainValidationError } from '../../domain/common/errors';
import { TxClient } from '../../domain/common/transaction';
import { StockEntry } from '../../domain/stock/stock-entry.domain';
import { StockRepository } from '../../domain/stock/stock.repository';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class PrismaStockRepository extends StockRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  private client(tx?: TxClient): Prisma.TransactionClient | PrismaService {
    return tx ?? this.prisma;
  }

  private toDomain(row: {
    articleId: string;
    warehouseId: string;
    quantity: Prisma.Decimal;
    updatedAt: Date;
  }): StockEntry {
    return new StockEntry(
      row.articleId,
      row.warehouseId,
      new Decimal(row.quantity.toString()),
      row.updatedAt,
    );
  }

  async findByArticle(articleId: string, tx?: TxClient): Promise<StockEntry[]> {
    const rows = await this.client(tx).stockEntry.findMany({
      where: { articleId },
    });
    return rows.map((r) => this.toDomain(r));
  }

  async findByWarehouse(warehouseId: string, tx?: TxClient): Promise<StockEntry[]> {
    const rows = await this.client(tx).stockEntry.findMany({
      where: { warehouseId },
    });
    return rows.map((r) => this.toDomain(r));
  }

  async findByArticleAndWarehouse(
    articleId: string,
    warehouseId: string,
    tx?: TxClient,
  ): Promise<StockEntry | null> {
    const row = await this.client(tx).stockEntry.findUnique({
      where: { articleId_warehouseId: { articleId, warehouseId } },
    });
    return row ? this.toDomain(row) : null;
  }

  async setQuantity(
    articleId: string,
    warehouseId: string,
    quantity: Decimal,
    tx?: TxClient,
  ): Promise<StockEntry> {
    const row = await this.client(tx).stockEntry.upsert({
      where: { articleId_warehouseId: { articleId, warehouseId } },
      create: {
        articleId,
        warehouseId,
        quantity: new Prisma.Decimal(quantity.toFixed()),
      },
      update: {
        quantity: new Prisma.Decimal(quantity.toFixed()),
      },
    });
    return this.toDomain(row);
  }

  async increment(
    articleId: string,
    warehouseId: string,
    delta: Decimal,
    tx?: TxClient,
  ): Promise<StockEntry> {
    const client = this.client(tx);
    const existing = await client.stockEntry.findUnique({
      where: { articleId_warehouseId: { articleId, warehouseId } },
    });

    if (existing) {
      const current = new Decimal(existing.quantity.toString());
      const next = current.plus(delta);
      if (next.isNegative()) {
        throw new DomainValidationError(
          `Stock would go negative (${current.toFixed()} + ${delta.toFixed()})`,
          { articleId, warehouseId, current: current.toFixed(), delta: delta.toFixed() },
        );
      }
      const row = await client.stockEntry.update({
        where: { articleId_warehouseId: { articleId, warehouseId } },
        data: { quantity: new Prisma.Decimal(next.toFixed()) },
      });
      return this.toDomain(row);
    }

    if (delta.isNegative()) {
      throw new DomainValidationError(
        'Cannot decrement non-existent stock entry',
        { articleId, warehouseId, delta: delta.toFixed() },
      );
    }

    const row = await client.stockEntry.create({
      data: {
        articleId,
        warehouseId,
        quantity: new Prisma.Decimal(delta.toFixed()),
      },
    });
    return this.toDomain(row);
  }
}
