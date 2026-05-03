"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcurementsMapper = void 0;
const decimal_js_1 = require("decimal.js");
const money_1 = require("../../domain/common/money");
const procurement_domain_1 = require("../../domain/procurements/procurement.domain");
const procurement_item_domain_1 = require("../../domain/procurements/procurement-item.domain");
class ProcurementsMapper {
    toDomain(p, currency) {
        const items = p.items.map((i) => new procurement_item_domain_1.ProcurementItem(i.id, i.procurementId, i.articleId, new decimal_js_1.Decimal(i.quantity.toString()), new money_1.Money(new decimal_js_1.Decimal(i.purchasePrice.toString()), currency)));
        return new procurement_domain_1.Procurement(p.id, p.organizationId, p.supplierId, p.warehouseId, p.createdById, p.note, p.createdAt, items, currency);
    }
}
exports.ProcurementsMapper = ProcurementsMapper;
//# sourceMappingURL=procurements.mapper.js.map