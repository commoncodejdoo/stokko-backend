"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockEntry = void 0;
const decimal_js_1 = require("decimal.js");
const errors_1 = require("../common/errors");
class StockEntry {
    articleId;
    warehouseId;
    updatedAt;
    quantity;
    constructor(articleId, warehouseId, quantity, updatedAt) {
        this.articleId = articleId;
        this.warehouseId = warehouseId;
        this.updatedAt = updatedAt;
        const dec = quantity instanceof decimal_js_1.Decimal ? quantity : new decimal_js_1.Decimal(quantity);
        if (dec.isNegative()) {
            throw new errors_1.DomainValidationError('Stock quantity cannot be negative', {
                articleId,
                warehouseId,
                quantity: dec.toFixed(),
            });
        }
        this.quantity = dec;
    }
    toSnapshot() {
        return {
            articleId: this.articleId,
            warehouseId: this.warehouseId,
            quantity: this.quantity.toFixed(3),
            updatedAt: this.updatedAt.toISOString(),
        };
    }
}
exports.StockEntry = StockEntry;
//# sourceMappingURL=stock-entry.domain.js.map