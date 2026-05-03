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
exports.PrismaCorrectionsRepository = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const corrections_repository_1 = require("../../domain/corrections/corrections.repository");
const prisma_service_1 = require("../common/prisma/prisma.service");
const corrections_mapper_1 = require("./corrections.mapper");
let PrismaCorrectionsRepository = class PrismaCorrectionsRepository extends corrections_repository_1.CorrectionsRepository {
    prisma;
    mapper = new corrections_mapper_1.CorrectionsMapper();
    constructor(prisma) {
        super();
        this.prisma = prisma;
    }
    client(tx) {
        return tx ?? this.prisma;
    }
    async create(input, tx) {
        const row = await this.client(tx).stockCorrection.create({
            data: {
                organizationId: input.organizationId,
                articleId: input.articleId,
                warehouseId: input.warehouseId,
                type: input.type,
                value: new client_1.Prisma.Decimal(input.value.toFixed()),
                reason: input.reason,
                note: input.note ?? null,
                createdById: input.createdById,
            },
        });
        return this.mapper.toDomain(row);
    }
    async findById(id, tx) {
        const row = await this.client(tx).stockCorrection.findUnique({
            where: { id },
        });
        return row ? this.mapper.toDomain(row) : null;
    }
    async list(filter, tx) {
        const where = {
            organizationId: filter.organizationId,
        };
        if (filter.articleId)
            where.articleId = filter.articleId;
        if (filter.warehouseId)
            where.warehouseId = filter.warehouseId;
        const page = filter.page ?? 1;
        const pageSize = filter.pageSize ?? 50;
        const client = this.client(tx);
        const [rows, total] = await Promise.all([
            client.stockCorrection.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            client.stockCorrection.count({ where }),
        ]);
        return {
            items: rows.map((r) => this.mapper.toDomain(r)),
            total,
        };
    }
};
exports.PrismaCorrectionsRepository = PrismaCorrectionsRepository;
exports.PrismaCorrectionsRepository = PrismaCorrectionsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaCorrectionsRepository);
//# sourceMappingURL=corrections.repository.js.map