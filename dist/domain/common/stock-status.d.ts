import { Decimal } from 'decimal.js';
export declare enum StockStatus {
    OK = "OK",
    WARNING = "WARNING",
    CRITICAL = "CRITICAL",
    UNKNOWN = "UNKNOWN"
}
export declare function computeStockStatus(quantity: Decimal, thresholdWarning: Decimal, thresholdCritical: Decimal): StockStatus;
