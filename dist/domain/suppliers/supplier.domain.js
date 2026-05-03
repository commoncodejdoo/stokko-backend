"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Supplier = void 0;
const errors_1 = require("../common/errors");
class Supplier {
    id;
    organizationId;
    name;
    contactPerson;
    phone;
    email;
    note;
    deletedAt;
    createdAt;
    updatedAt;
    constructor(id, organizationId, name, contactPerson, phone, email, note, deletedAt, createdAt, updatedAt) {
        this.id = id;
        this.organizationId = organizationId;
        this.name = name;
        this.contactPerson = contactPerson;
        this.phone = phone;
        this.email = email;
        this.note = note;
        this.deletedAt = deletedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        if (!name?.trim()) {
            throw new errors_1.DomainValidationError('Supplier name is required');
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
            contactPerson: this.contactPerson,
            phone: this.phone,
            email: this.email,
            note: this.note,
            deletedAt: this.deletedAt?.toISOString() ?? null,
            createdAt: this.createdAt.toISOString(),
            updatedAt: this.updatedAt.toISOString(),
        };
    }
}
exports.Supplier = Supplier;
//# sourceMappingURL=supplier.domain.js.map