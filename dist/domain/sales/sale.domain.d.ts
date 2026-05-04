import { Decimal } from 'decimal.js';
import { Money } from '../common/money';
import { SaleItem } from './sale-item.domain';
export declare class Sale {
    readonly id: string;
    readonly organizationId: string;
    readonly shiftId: string;
    readonly warehouseId: string;
    readonly createdById: string;
    readonly createdAt: Date;
    readonly items: SaleItem[];
    readonly currency: string;
    constructor(id: string, organizationId: string, shiftId: string, warehouseId: string, createdById: string, createdAt: Date, items: SaleItem[], currency: string);
    totalQuantity(): Decimal;
    totalRevenue(): Money;
    toSnapshot(): Record<string, unknown>;
}
