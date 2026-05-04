"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesMapper = void 0;
const decimal_js_1 = require("decimal.js");
const money_1 = require("../../domain/common/money");
const sale_item_domain_1 = require("../../domain/sales/sale-item.domain");
const sale_domain_1 = require("../../domain/sales/sale.domain");
const shift_domain_1 = require("../../domain/sales/shift.domain");
class SalesMapper {
    toShift(p, currency) {
        return new shift_domain_1.Shift(p.id, p.organizationId, p.date, p.openedAt, p.closedAt, p.closedById, p.status, new decimal_js_1.Decimal(p.totalQuantity.toString()), new money_1.Money(new decimal_js_1.Decimal(p.totalRevenue.toString()), currency));
    }
    toSale(p, currency) {
        const items = p.items.map((i) => new sale_item_domain_1.SaleItem(i.id, i.saleId, i.articleId, new decimal_js_1.Decimal(i.quantity.toString()), new money_1.Money(new decimal_js_1.Decimal(i.unitPrice.toString()), currency)));
        return new sale_domain_1.Sale(p.id, p.organizationId, p.shiftId, p.warehouseId, p.createdById, p.createdAt, items, currency);
    }
}
exports.SalesMapper = SalesMapper;
//# sourceMappingURL=sales.mapper.js.map