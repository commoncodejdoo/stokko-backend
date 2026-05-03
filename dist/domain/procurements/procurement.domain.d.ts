import { Money } from '../common/money';
import { ProcurementItem } from './procurement-item.domain';
export declare class Procurement {
    readonly id: string;
    readonly organizationId: string;
    readonly supplierId: string;
    readonly warehouseId: string;
    readonly createdById: string;
    readonly note: string | null;
    readonly createdAt: Date;
    readonly items: ProcurementItem[];
    readonly currency: string;
    constructor(id: string, organizationId: string, supplierId: string, warehouseId: string, createdById: string, note: string | null, createdAt: Date, items: ProcurementItem[], currency: string);
    totalValue(): Money;
    toSnapshot(): Record<string, unknown>;
}
