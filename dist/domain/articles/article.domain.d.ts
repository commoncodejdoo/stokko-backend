import { Decimal } from 'decimal.js';
import { Money } from '../common/money';
import { StockStatus } from '../common/stock-status';
import { Unit } from '../common/unit';
export declare class Article {
    readonly id: string;
    readonly organizationId: string;
    readonly sku: string;
    readonly name: string;
    readonly purchasePrice: Money;
    readonly salePrice: Money;
    readonly unit: Unit;
    readonly categoryId: string;
    readonly supplierId: string | null;
    readonly createdById: string;
    readonly deletedAt: Date | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    readonly thresholdWarning: Decimal;
    readonly thresholdCritical: Decimal;
    constructor(id: string, organizationId: string, sku: string, name: string, purchasePrice: Money, salePrice: Money, unit: Unit, categoryId: string, supplierId: string | null, thresholdWarning: Decimal | string | number, thresholdCritical: Decimal | string | number, createdById: string, deletedAt: Date | null, createdAt: Date, updatedAt: Date);
    status(quantity: Decimal | string | number): StockStatus;
    isDeleted(): boolean;
    toSnapshot(): Record<string, unknown>;
}
