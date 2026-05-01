"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationsMapper = void 0;
const organization_domain_1 = require("../../domain/organizations/organization.domain");
class OrganizationsMapper {
    toDomain(p) {
        return new organization_domain_1.Organization(p.id, p.name, p.currency, p.isActive, p.createdAt, p.updatedAt);
    }
}
exports.OrganizationsMapper = OrganizationsMapper;
//# sourceMappingURL=organizations.mapper.js.map