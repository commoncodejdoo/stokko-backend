"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Warehouse = void 0;
const errors_1 = require("../common/errors");
const HEX_RX = /^#[0-9a-fA-F]{6}$/;
class Warehouse {
    id;
    organizationId;
    name;
    color;
    deletedAt;
    createdAt;
    updatedAt;
    constructor(id, organizationId, name, color, deletedAt, createdAt, updatedAt) {
        this.id = id;
        this.organizationId = organizationId;
        this.name = name;
        this.color = color;
        this.deletedAt = deletedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        if (!name?.trim()) {
            throw new errors_1.DomainValidationError('Warehouse name is required');
        }
        if (!HEX_RX.test(color)) {
            throw new errors_1.DomainValidationError(`Invalid hex color: "${color}"`, { color });
        }
    }
    initials() {
        const words = this.name.trim().split(/\s+/);
        if (words.length === 1)
            return words[0].slice(0, 2).toUpperCase();
        return (words[0][0] + words[1][0]).toUpperCase();
    }
    isDeleted() {
        return this.deletedAt !== null;
    }
    toSnapshot() {
        return {
            id: this.id,
            organizationId: this.organizationId,
            name: this.name,
            color: this.color,
            deletedAt: this.deletedAt?.toISOString() ?? null,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
        };
    }
}
exports.Warehouse = Warehouse;
//# sourceMappingURL=warehouse.domain.js.map