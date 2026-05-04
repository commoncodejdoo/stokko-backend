import { Decimal } from 'decimal.js';
export declare class StockTransferItem {
    readonly id: string;
    readonly transferId: string;
    readonly articleId: string;
    readonly quantity: Decimal;
    constructor(id: string, transferId: string, articleId: string, quantity: Decimal | string | number);
    toSnapshot(): Record<string, unknown>;
}
