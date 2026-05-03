import { Decimal } from 'decimal.js';
import { Money } from '../common/money';
export declare class ProcurementItem {
    readonly id: string;
    readonly procurementId: string;
    readonly articleId: string;
    readonly purchasePrice: Money;
    readonly quantity: Decimal;
    constructor(id: string, procurementId: string, articleId: string, quantity: Decimal | string | number, purchasePrice: Money);
    lineTotal(): Money;
    toSnapshot(): Record<string, unknown>;
}
