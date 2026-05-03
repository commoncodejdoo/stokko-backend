import { Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { DomainValidationError } from '../common/errors';
import { TxClient } from '../common/transaction';
import { StockEntry } from './stock-entry.domain';
import { StockRepository } from './stock.repository';

@Injectable()
export class StockService {
  constructor(private readonly repo: StockRepository) {}

  async getByArticle(articleId: string, tx?: TxClient): Promise<StockEntry[]> {
    return this.repo.findByArticle(articleId, tx);
  }

  async getByWarehouse(warehouseId: string, tx?: TxClient): Promise<StockEntry[]> {
    return this.repo.findByWarehouse(warehouseId, tx);
  }

  async getByArticleAndWarehouse(
    articleId: string,
    warehouseId: string,
    tx?: TxClient,
  ): Promise<StockEntry | null> {
    return this.repo.findByArticleAndWarehouse(articleId, warehouseId, tx);
  }

  async setQuantity(
    articleId: string,
    warehouseId: string,
    quantity: Decimal | string | number,
    tx?: TxClient,
  ): Promise<StockEntry> {
    const dec = quantity instanceof Decimal ? quantity : new Decimal(quantity);
    if (dec.isNegative()) {
      throw new DomainValidationError('Stock quantity cannot be negative');
    }
    return this.repo.setQuantity(articleId, warehouseId, dec, tx);
  }

  async increment(
    articleId: string,
    warehouseId: string,
    delta: Decimal | string | number,
    tx?: TxClient,
  ): Promise<StockEntry> {
    const dec = delta instanceof Decimal ? delta : new Decimal(delta);
    return this.repo.increment(articleId, warehouseId, dec, tx);
  }
}
