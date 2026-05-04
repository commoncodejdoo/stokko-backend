"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransfersMapper = void 0;
const decimal_js_1 = require("decimal.js");
const stock_transfer_domain_1 = require("../../domain/transfers/stock-transfer.domain");
const stock_transfer_item_domain_1 = require("../../domain/transfers/stock-transfer-item.domain");
class TransfersMapper {
    toDomain(t) {
        const items = t.items.map((i) => new stock_transfer_item_domain_1.StockTransferItem(i.id, i.transferId, i.articleId, new decimal_js_1.Decimal(i.quantity.toString())));
        return new stock_transfer_domain_1.StockTransfer(t.id, t.organizationId, t.sourceWarehouseId, t.destinationWarehouseId, t.createdById, t.note, t.createdAt, items);
    }
}
exports.TransfersMapper = TransfersMapper;
//# sourceMappingURL=transfers.mapper.js.map