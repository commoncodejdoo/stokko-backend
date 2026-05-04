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
exports.PrismaProcurementsRepository = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const procurements_repository_1 = require("../../domain/procurements/procurements.repository");
const prisma_service_1 = require("../common/prisma/prisma.service");
const procurements_mapper_1 = require("./procurements.mapper");
let PrismaProcurementsRepository = class PrismaProcurementsRepository extends procurements_repository_1.ProcurementsRepository {
    prisma;
    mapper = new procurements_mapper_1.ProcurementsMapper();
    constructor(prisma) {
        super();
        this.prisma = prisma;
    }
    client(tx) {
        return tx ?? this.prisma;
    }
    async create(input, currency, tx) {
        const row = await this.client(tx).procurement.create({
            data: {
                organizationId: input.organizationId,
                supplierId: input.supplierId ?? null,
                warehouseId: input.warehouseId,
                createdById: input.createdById,
                note: input.note ?? null,
                items: {
                    create: input.items.map((i) => ({
                        articleId: i.articleId,
                        quantity: new client_1.Prisma.Decimal(i.quantity.toFixed()),
                        purchasePrice: new client_1.Prisma.Decimal(i.purchasePrice.toFixed()),
                    })),
                },
            },
            include: { items: true },
        });
        return this.mapper.toDomain(row, currency);
    }
    async findById(id, currency, tx) {
        const row = await this.client(tx).procurement.findUnique({
            where: { id },
            include: { items: true },
        });
        return row ? this.mapper.toDomain(row, currency) : null;
    }
    async countCreatedSince(organizationId, since, tx) {
        return this.client(tx).procurement.count({
            where: { organizationId, createdAt: { gte: since } },
        });
    }
    async list(filter, currency, tx) {
        const where = {
            organizationId: filter.organizationId,
        };
        if (filter.supplierId)
            where.supplierId = filter.supplierId;
        if (filter.warehouseId)
            where.warehouseId = filter.warehouseId;
        if (filter.createdSince)
            where.createdAt = { gte: filter.createdSince };
        const page = filter.page ?? 1;
        const pageSize = filter.pageSize ?? 50;
        const client = this.client(tx);
        const [rows, total] = await Promise.all([
            client.procurement.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
                include: { items: true },
            }),
            client.procurement.count({ where }),
        ]);
        return {
            items: rows.map((r) => this.mapper.toDomain(r, currency)),
            total,
        };
    }
};
exports.PrismaProcurementsRepository = PrismaProcurementsRepository;
exports.PrismaProcurementsRepository = PrismaProcurementsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaProcurementsRepository);
//# sourceMappingURL=procurements.repository.js.map