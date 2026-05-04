"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockTransferItem = void 0;
const decimal_js_1 = require("decimal.js");
const errors_1 = require("../common/errors");
class StockTransferItem {
    id;
    transferId;
    articleId;
    quantity;
    constructor(id, transferId, articleId, quantity) {
        this.id = id;
        this.transferId = transferId;
        this.articleId = articleId;
        const qty = quantity instanceof decimal_js_1.Decimal ? quantity : new decimal_js_1.Decimal(quantity);
        if (qty.isNegative() || qty.isZero()) {
            throw new errors_1.DomainValidationError('Transfer item quantity must be > 0', {
                articleId,
                quantity: qty.toFixed(),
            });
        }
        this.quantity = qty;
    }
    toSnapshot() {
        return {
            id: this.id,
            transferId: this.transferId,
            articleId: this.articleId,
            quantity: this.quantity.toFixed(3),
        };
    }
}
exports.StockTransferItem = StockTransferItem;
//# sourceMappingURL=stock-transfer-item.domain.js.map