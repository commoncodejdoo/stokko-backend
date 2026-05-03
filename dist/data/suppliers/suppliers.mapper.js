"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuppliersMapper = void 0;
const supplier_domain_1 = require("../../domain/suppliers/supplier.domain");
class SuppliersMapper {
    toDomain(p) {
        return new supplier_domain_1.Supplier(p.id, p.organizationId, p.name, p.contactPerson, p.phone, p.email, p.note, p.deletedAt, p.createdAt, p.updatedAt);
    }
}
exports.SuppliersMapper = SuppliersMapper;
//# sourceMappingURL=suppliers.mapper.js.map