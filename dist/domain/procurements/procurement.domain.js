"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Procurement = void 0;
const errors_1 = require("../common/errors");
const money_1 = require("../common/money");
class Procurement {
    id;
    organizationId;
    supplierId;
    warehouseId;
    createdById;
    note;
    createdAt;
    items;
    currency;
    constructor(id, organizationId, supplierId, warehouseId, createdById, note, createdAt, items, currency) {
        this.id = id;
        this.organizationId = organizationId;
        this.supplierId = supplierId;
        this.warehouseId = warehouseId;
        this.createdById = createdById;
        this.note = note;
        this.createdAt = createdAt;
        this.items = items;
        this.currency = currency;
        if (items.length === 0) {
            throw new errors_1.DomainValidationError('Procurement must have at least one item');
        }
        for (const item of items) {
            if (item.purchasePrice.currency !== currency) {
                throw new errors_1.DomainValidationError('All items must share the procurement currency', {
                    item: item.id,
                    itemCurrency: item.purchasePrice.currency,
                    expected: currency,
                });
            }
        }
    }
    totalValue() {
        return this.items.reduce((sum, item) => sum.add(item.lineTotal()), new money_1.Money(0, this.currency));
    }
    toSnapshot() {
        return {
            id: this.id,
            organizationId: this.organizationId,
            supplierId: this.supplierId,
            warehouseId: this.warehouseId,
            createdById: this.createdById,
            note: this.note,
            createdAt: this.createdAt.toISOString(),
            currency: this.currency,
            items: this.items.map((i) => i.toSnapshot()),
            totalValue: this.totalValue().toFixed(),
        };
    }
}
exports.Procurement = Procurement;
//# sourceMappingURL=procurement.domain.js.map