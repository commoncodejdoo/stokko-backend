"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockTransfer = void 0;
const errors_1 = require("../common/errors");
class StockTransfer {
    id;
    organizationId;
    sourceWarehouseId;
    destinationWarehouseId;
    createdById;
    note;
    createdAt;
    items;
    constructor(id, organizationId, sourceWarehouseId, destinationWarehouseId, createdById, note, createdAt, items) {
        this.id = id;
        this.organizationId = organizationId;
        this.sourceWarehouseId = sourceWarehouseId;
        this.destinationWarehouseId = destinationWarehouseId;
        this.createdById = createdById;
        this.note = note;
        this.createdAt = createdAt;
        this.items = items;
        if (sourceWarehouseId === destinationWarehouseId) {
            throw new errors_1.DomainValidationError('Source and destination warehouse must differ', { sourceWarehouseId, destinationWarehouseId });
        }
        if (items.length === 0) {
            throw new errors_1.DomainValidationError('Transfer must have at least one item');
        }
    }
    toSnapshot() {
        return {
            id: this.id,
            organizationId: this.organizationId,
            sourceWarehouseId: this.sourceWarehouseId,
            destinationWarehouseId: this.destinationWarehouseId,
            createdById: this.createdById,
            note: this.note,
            createdAt: this.createdAt.toISOString(),
            items: this.items.map((i) => i.toSnapshot()),
        };
    }
}
exports.StockTransfer = StockTransfer;
//# sourceMappingURL=stock-transfer.domain.js.map