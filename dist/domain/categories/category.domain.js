"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
const errors_1 = require("../common/errors");
class Category {
    id;
    organizationId;
    name;
    isPredefined;
    deletedAt;
    createdAt;
    updatedAt;
    constructor(id, organizationId, name, isPredefined, deletedAt, createdAt, updatedAt) {
        this.id = id;
        this.organizationId = organizationId;
        this.name = name;
        this.isPredefined = isPredefined;
        this.deletedAt = deletedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        if (!name?.trim()) {
            throw new errors_1.DomainValidationError('Category name is required');
        }
    }
    isDeleted() {
        return this.deletedAt !== null;
    }
    toSnapshot() {
        return {
            id: this.id,
            organizationId: this.organizationId,
            name: this.name,
            isPredefined: this.isPredefined,
            deletedAt: this.deletedAt?.toISOString() ?? null,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
        };
    }
}
exports.Category = Category;
//# sourceMappingURL=category.domain.js.map