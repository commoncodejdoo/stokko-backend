import { Decimal } from 'decimal.js';
export declare enum CorrectionType {
    ABSOLUTE = "ABSOLUTE",
    DELTA = "DELTA"
}
export declare enum CorrectionReason {
    COUNT = "COUNT",
    WRITE_OFF = "WRITE_OFF",
    INPUT_ERROR = "INPUT_ERROR",
    OTHER = "OTHER"
}
export declare class StockCorrection {
    readonly id: string;
    readonly organizationId: string;
    readonly articleId: string;
    readonly warehouseId: string;
    readonly type: CorrectionType;
    readonly reason: CorrectionReason;
    readonly note: string | null;
    readonly createdById: string;
    readonly createdAt: Date;
    readonly value: Decimal;
    constructor(id: string, organizationId: string, articleId: string, warehouseId: string, type: CorrectionType, value: Decimal | string | number, reason: CorrectionReason, note: string | null, createdById: string, createdAt: Date);
    applyTo(currentQuantity: Decimal): Decimal;
    deltaFrom(currentQuantity: Decimal): Decimal;
    toSnapshot(): Record<string, unknown>;
}
