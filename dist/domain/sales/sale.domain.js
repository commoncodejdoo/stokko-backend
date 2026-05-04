"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Sale = void 0;
const decimal_js_1 = require("decimal.js");
const errors_1 = require("../common/errors");
const money_1 = require("../common/money");
class Sale {
    id;
    organizationId;
    shiftId;
    warehouseId;
    createdById;
    createdAt;
    items;
    currency;
    constructor(id, organizationId, shiftId, warehouseId, createdById, createdAt, items, currency) {
        this.id = id;
        this.organizationId = organizationId;
        this.shiftId = shiftId;
        this.warehouseId = warehouseId;
        this.createdById = createdById;
        this.createdAt = createdAt;
        this.items = items;
        this.currency = currency;
        if (items.length === 0) {
            throw new errors_1.DomainValidationError('Sale must have at least one item');
        }
        for (const it of items) {
            if (it.unitPrice.currency !== currency) {
                throw new errors_1.DomainValidationError('All items must share the sale currency', {
                    item: it.id,
                    itemCurrency: it.unitPrice.currency,
                    expected: currency,
                });
            }
        }
    }
    totalQuantity() {
        return this.items.reduce((sum, i) => sum.plus(i.quantity), new decimal_js_1.Decimal(0));
    }
    totalRevenue() {
        return this.items.reduce((sum, i) => sum.add(i.lineTotal()), new money_1.Money(0, this.currency));
    }
    toSnapshot() {
        return {
            id: this.id,
            organizationId: this.organizationId,
            shiftId: this.shiftId,
            warehouseId: this.warehouseId,
            createdById: this.createdById,
            createdAt: this.createdAt.toISOString(),
            currency: this.currency,
            items: this.items.map((i) => i.toSnapshot()),
            totalQuantity: this.totalQuantity().toFixed(3),
            totalRevenue: this.totalRevenue().toFixed(),
        };
    }
}
exports.Sale = Sale;
//# sourceMappingURL=sale.domain.js.map