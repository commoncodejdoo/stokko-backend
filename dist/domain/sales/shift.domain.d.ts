import { Decimal } from 'decimal.js';
import { Money } from '../common/money';
export type ShiftStatus = 'OPEN' | 'CLOSED';
export declare class Shift {
    readonly id: string;
    readonly organizationId: string;
    readonly date: Date;
    readonly openedAt: Date;
    readonly closedAt: Date | null;
    readonly closedById: string | null;
    readonly status: ShiftStatus;
    readonly totalQuantity: Decimal;
    readonly totalRevenue: Money;
    constructor(id: string, organizationId: string, date: Date, openedAt: Date, closedAt: Date | null, closedById: string | null, status: ShiftStatus, totalQuantity: Decimal, totalRevenue: Money);
    isClosed(): boolean;
    toSnapshot(): Record<string, unknown>;
}
