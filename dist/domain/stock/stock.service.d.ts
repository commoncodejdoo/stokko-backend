import { Decimal } from 'decimal.js';
import { TxClient } from '../common/transaction';
import { StockEntry } from './stock-entry.domain';
import { StockRepository } from './stock.repository';
export declare class StockService {
    private readonly repo;
    constructor(repo: StockRepository);
    getByArticle(articleId: string, tx?: TxClient): Promise<StockEntry[]>;
    getByWarehouse(warehouseId: string, tx?: TxClient): Promise<StockEntry[]>;
    getByArticleAndWarehouse(articleId: string, warehouseId: string, tx?: TxClient): Promise<StockEntry | null>;
    setQuantity(articleId: string, warehouseId: string, quantity: Decimal | string | number, tx?: TxClient): Promise<StockEntry>;
    increment(articleId: string, warehouseId: string, delta: Decimal | string | number, tx?: TxClient): Promise<StockEntry>;
}
