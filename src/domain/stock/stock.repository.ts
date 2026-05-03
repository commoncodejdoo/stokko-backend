import { Decimal } from 'decimal.js';
import { TxClient } from '../common/transaction';
import { StockEntry } from './stock-entry.domain';

export abstract class StockRepository {
  abstract findByArticle(articleId: string, tx?: TxClient): Promise<StockEntry[]>;
  abstract findByWarehouse(warehouseId: string, tx?: TxClient): Promise<StockEntry[]>;
  abstract findByArticleAndWarehouse(
    articleId: string,
    warehouseId: string,
    tx?: TxClient,
  ): Promise<StockEntry | null>;

  /**
   * Sets the absolute quantity for (article, warehouse). Creates the row
   * if it doesn't exist.
   */
  abstract setQuantity(
    articleId: string,
    warehouseId: string,
    quantity: Decimal,
    tx?: TxClient,
  ): Promise<StockEntry>;

  /**
   * Atomically increments the quantity by `delta` (which may be negative).
   * Throws if the resulting quantity would be negative.
   * Creates the row at `delta` if it didn't exist (delta must be >= 0 then).
   */
  abstract increment(
    articleId: string,
    warehouseId: string,
    delta: Decimal,
    tx?: TxClient,
  ): Promise<StockEntry>;
}
