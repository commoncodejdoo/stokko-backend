import { Decimal } from 'decimal.js';
import { TxClient } from '../common/transaction';
import { StockEntry } from './stock-entry.domain';
export declare abstract class StockRepository {
    abstract findByArticle(articleId: string, tx?: TxClient): Promise<StockEntry[]>;
    abstract findByWarehouse(warehouseId: string, tx?: TxClient): Promise<StockEntry[]>;
    abstract findByArticleAndWarehouse(articleId: string, warehouseId: string, tx?: TxClient): Promise<StockEntry | null>;
    abstract setQuantity(articleId: string, warehouseId: string, quantity: Decimal, tx?: TxClient): Promise<StockEntry>;
    abstract increment(articleId: string, warehouseId: string, delta: Decimal, tx?: TxClient): Promise<StockEntry>;
}
