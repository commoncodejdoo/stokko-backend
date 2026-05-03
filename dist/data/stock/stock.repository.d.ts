import { Decimal } from 'decimal.js';
import { TxClient } from '../../domain/common/transaction';
import { StockEntry } from '../../domain/stock/stock-entry.domain';
import { StockRepository } from '../../domain/stock/stock.repository';
import { PrismaService } from '../common/prisma/prisma.service';
export declare class PrismaStockRepository extends StockRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private client;
    private toDomain;
    findByArticle(articleId: string, tx?: TxClient): Promise<StockEntry[]>;
    findByWarehouse(warehouseId: string, tx?: TxClient): Promise<StockEntry[]>;
    findByArticleAndWarehouse(articleId: string, warehouseId: string, tx?: TxClient): Promise<StockEntry | null>;
    setQuantity(articleId: string, warehouseId: string, quantity: Decimal, tx?: TxClient): Promise<StockEntry>;
    increment(articleId: string, warehouseId: string, delta: Decimal, tx?: TxClient): Promise<StockEntry>;
}
