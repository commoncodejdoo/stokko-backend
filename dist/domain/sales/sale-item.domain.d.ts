import { Decimal } from 'decimal.js';
import { Money } from '../common/money';
export declare class SaleItem {
    readonly id: string;
    readonly saleId: string;
    readonly articleId: string;
    readonly unitPrice: Money;
    readonly quantity: Decimal;
    constructor(id: string, saleId: string, articleId: string, quantity: Decimal | string | number, unitPrice: Money);
    lineTotal(): Money;
    toSnapshot(): Record<string, unknown>;
}
