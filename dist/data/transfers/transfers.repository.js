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
exports.PrismaTransfersRepository = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const transfers_repository_1 = require("../../domain/transfers/transfers.repository");
const prisma_service_1 = require("../common/prisma/prisma.service");
const transfers_mapper_1 = require("./transfers.mapper");
let PrismaTransfersRepository = class PrismaTransfersRepository extends transfers_repository_1.TransfersRepository {
    prisma;
    mapper = new transfers_mapper_1.TransfersMapper();
    constructor(prisma) {
        super();
        this.prisma = prisma;
    }
    client(tx) {
        return tx ?? this.prisma;
    }
    async create(input, tx) {
        const row = await this.client(tx).stockTransfer.create({
            data: {
                organizationId: input.organizationId,
                sourceWarehouseId: input.sourceWarehouseId,
                destinationWarehouseId: input.destinationWarehouseId,
                createdById: input.createdById,
                note: input.note ?? null,
                items: {
                    create: input.items.map((i) => ({
                        articleId: i.articleId,
                        quantity: new client_1.Prisma.Decimal(i.quantity.toFixed()),
                    })),
                },
            },
            include: { items: true },
        });
        return this.mapper.toDomain(row);
    }
    async findById(id, tx) {
        const row = await this.client(tx).stockTransfer.findUnique({
            where: { id },
            include: { items: true },
        });
        return row ? this.mapper.toDomain(row) : null;
    }
    async list(filter, tx) {
        const where = {
            organizationId: filter.organizationId,
        };
        if (filter.warehouseId) {
            where.OR = [
                { sourceWarehouseId: filter.warehouseId },
                { destinationWarehouseId: filter.warehouseId },
            ];
        }
        const page = filter.page ?? 1;
        const pageSize = filter.pageSize ?? 50;
        const client = this.client(tx);
        const [rows, total] = await Promise.all([
            client.stockTransfer.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
                include: { items: true },
            }),
            client.stockTransfer.count({ where }),
        ]);
        return {
            items: rows.map((r) => this.mapper.toDomain(r)),
            total,
        };
    }
};
exports.PrismaTransfersRepository = PrismaTransfersRepository;
exports.PrismaTransfersRepository = PrismaTransfersRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaTransfersRepository);
//# sourceMappingURL=transfers.repository.js.map