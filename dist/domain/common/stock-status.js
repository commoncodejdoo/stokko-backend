"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockStatus = void 0;
exports.computeStockStatus = computeStockStatus;
var StockStatus;
(function (StockStatus) {
    StockStatus["OK"] = "OK";
    StockStatus["WARNING"] = "WARNING";
    StockStatus["CRITICAL"] = "CRITICAL";
    StockStatus["UNKNOWN"] = "UNKNOWN";
})(StockStatus || (exports.StockStatus = StockStatus = {}));
function computeStockStatus(quantity, thresholdWarning, thresholdCritical) {
    if (quantity.lessThanOrEqualTo(thresholdCritical))
        return StockStatus.CRITICAL;
    if (quantity.lessThanOrEqualTo(thresholdWarning))
        return StockStatus.WARNING;
    return StockStatus.OK;
}
//# sourceMappingURL=stock-status.js.map