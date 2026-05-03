"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarehousesMapper = void 0;
const warehouse_domain_1 = require("../../domain/warehouses/warehouse.domain");
class WarehousesMapper {
    toDomain(p) {
        return new warehouse_domain_1.Warehouse(p.id, p.organizationId, p.name, p.color, p.deletedAt, p.createdAt, p.updatedAt);
    }
}
exports.WarehousesMapper = WarehousesMapper;
//# sourceMappingURL=warehouses.mapper.js.map