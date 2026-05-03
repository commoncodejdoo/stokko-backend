"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaWarehousesRepository = void 0;
const common_1 = require("@nestjs/common");
const warehouses_repository_1 = require("../../domain/warehouses/warehouses.repository");
const prisma_service_1 = require("../common/prisma/prisma.service");
const where_not_deleted_1 = require("../common/where/where-not-deleted");
const warehouses_mapper_1 = require("./warehouses.mapper");
let PrismaWarehousesRepository = class PrismaWarehousesRepository extends warehouses_repository_1.WarehousesRepository {
    prisma;
    mapper = new warehouses_mapper_1.WarehousesMapper();
    constructor(prisma) {
        super();
        this.prisma = prisma;
    }
    client(tx) {
        return tx ?? this.prisma;
    }
    async create(input, tx) {
        const row = await this.client(tx).warehouse.create({ data: input });
        return this.mapper.toDomain(row);
    }
    async findById(id, tx) {
        const row = await this.client(tx).warehouse.findUnique({ where: { id } });
        return row ? this.mapper.toDomain(row) : null;
    }
    async listByOrg(organizationId, tx) {
        const rows = await this.client(tx).warehouse.findMany({
            where: { organizationId, ...(0, where_not_deleted_1.whereNotDeleted)() },
            orderBy: { createdAt: 'asc' },
        });
        return rows.map((r) => this.mapper.toDomain(r));
    }
    async update(id, patch, tx) {
        const row = await this.client(tx).warehouse.update({ where: { id }, data: patch });
        return this.mapper.toDomain(row);
    }
    async softDelete(id, tx) {
        const row = await this.client(tx).warehouse.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        return this.mapper.toDomain(row);
    }
};
exports.PrismaWarehousesRepository = PrismaWarehousesRepository;
exports.PrismaWarehousesRepository = PrismaWarehousesRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaWarehousesRepository);
//# sourceMappingURL=warehouses.repository.js.map