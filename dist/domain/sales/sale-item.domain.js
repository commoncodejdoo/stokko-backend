"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaleItem = void 0;
const decimal_js_1 = require("decimal.js");
const errors_1 = require("../common/errors");
class SaleItem {
    id;
    saleId;
    articleId;
    unitPrice;
    quantity;
    constructor(id, saleId, articleId, quantity, unitPrice) {
        this.id = id;
        this.saleId = saleId;
        this.articleId = articleId;
        this.unitPrice = unitPrice;
        const qty = quantity instanceof decimal_js_1.Decimal ? quantity : new decimal_js_1.Decimal(quantity);
        if (qty.isNegative() || qty.isZero()) {
            throw new errors_1.DomainValidationError('Sale item quantity must be > 0', {
                articleId,
                quantity: qty.toFixed(),
            });
        }
        this.quantity = qty;
    }
    lineTotal() {
        return this.unitPrice.multiply(this.quantity);
    }
    toSnapshot() {
        return {
            id: this.id,
            saleId: this.saleId,
            articleId: this.articleId,
            quantity: this.quantity.toFixed(3),
            unitPrice: this.unitPrice.toFixed(),
            currency: this.unitPrice.currency,
        };
    }
}
exports.SaleItem = SaleItem;
//# sourceMappingURL=sale-item.domain.js.map