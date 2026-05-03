"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesMapper = void 0;
const category_domain_1 = require("../../domain/categories/category.domain");
class CategoriesMapper {
    toDomain(p) {
        return new category_domain_1.Category(p.id, p.organizationId, p.name, p.isPredefined, p.deletedAt, p.createdAt, p.updatedAt);
    }
}
exports.CategoriesMapper = CategoriesMapper;
//# sourceMappingURL=categories.mapper.js.map