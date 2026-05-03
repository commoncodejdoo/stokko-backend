import { Decimal } from 'decimal.js';
export declare class StockEntry {
    readonly articleId: string;
    readonly warehouseId: string;
    readonly updatedAt: Date;
    readonly quantity: Decimal;
    constructor(articleId: string, warehouseId: string, quantity: Decimal | string | number, updatedAt: Date);
    toSnapshot(): Record<string, unknown>;
}
