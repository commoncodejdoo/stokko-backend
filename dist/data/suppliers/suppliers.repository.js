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
exports.PrismaSuppliersRepository = void 0;
const common_1 = require("@nestjs/common");
const suppliers_repository_1 = require("../../domain/suppliers/suppliers.repository");
const prisma_service_1 = require("../common/prisma/prisma.service");
const where_not_deleted_1 = require("../common/where/where-not-deleted");
const suppliers_mapper_1 = require("./suppliers.mapper");
let PrismaSuppliersRepository = class PrismaSuppliersRepository extends suppliers_repository_1.SuppliersRepository {
    prisma;
    mapper = new suppliers_mapper_1.SuppliersMapper();
    constructor(prisma) {
        super();
        this.prisma = prisma;
    }
    client(tx) {
        return tx ?? this.prisma;
    }
    async create(input, tx) {
        const row = await this.client(tx).supplier.create({
            data: {
                organizationId: input.organizationId,
                name: input.name,
                contactPerson: input.contactPerson ?? null,
                phone: input.phone ?? null,
                email: input.email ?? null,
                note: input.note ?? null,
            },
        });
        return this.mapper.toDomain(row);
    }
    async findById(id, tx) {
        const row = await this.client(tx).supplier.findUnique({ where: { id } });
        return row ? this.mapper.toDomain(row) : null;
    }
    async listByOrg(organizationId, tx) {
        const rows = await this.client(tx).supplier.findMany({
            where: { organizationId, ...(0, where_not_deleted_1.whereNotDeleted)() },
            orderBy: { name: 'asc' },
        });
        return rows.map((r) => this.mapper.toDomain(r));
    }
    async update(id, patch, tx) {
        const row = await this.client(tx).supplier.update({ where: { id }, data: patch });
        return this.mapper.toDomain(row);
    }
    async softDelete(id, tx) {
        const row = await this.client(tx).supplier.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        return this.mapper.toDomain(row);
    }
};
exports.PrismaSuppliersRepository = PrismaSuppliersRepository;
exports.PrismaSuppliersRepository = PrismaSuppliersRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaSuppliersRepository);
//# sourceMappingURL=suppliers.repository.js.map