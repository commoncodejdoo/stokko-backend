"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcurementItem = void 0;
const decimal_js_1 = require("decimal.js");
const errors_1 = require("../common/errors");
class ProcurementItem {
    id;
    procurementId;
    articleId;
    purchasePrice;
    quantity;
    constructor(id, procurementId, articleId, quantity, purchasePrice) {
        this.id = id;
        this.procurementId = procurementId;
        this.articleId = articleId;
        this.purchasePrice = purchasePrice;
        const qty = quantity instanceof decimal_js_1.Decimal ? quantity : new decimal_js_1.Decimal(quantity);
        if (qty.isNegative() || qty.isZero()) {
            throw new errors_1.DomainValidationError('Procurement item quantity must be > 0', {
                articleId,
                quantity: qty.toFixed(),
            });
        }
        this.quantity = qty;
    }
    lineTotal() {
        return this.purchasePrice.multiply(this.quantity);
    }
    toSnapshot() {
        return {
            id: this.id,
            procurementId: this.procurementId,
            articleId: this.articleId,
            quantity: this.quantity.toFixed(3),
            purchasePrice: this.purchasePrice.toFixed(),
            currency: this.purchasePrice.currency,
        };
    }
}
exports.ProcurementItem = ProcurementItem;
//# sourceMappingURL=procurement-item.domain.js.map