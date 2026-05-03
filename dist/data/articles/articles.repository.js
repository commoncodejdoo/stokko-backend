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
exports.PrismaArticlesRepository = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const articles_repository_1 = require("../../domain/articles/articles.repository");
const prisma_service_1 = require("../common/prisma/prisma.service");
const where_not_deleted_1 = require("../common/where/where-not-deleted");
const articles_mapper_1 = require("./articles.mapper");
let PrismaArticlesRepository = class PrismaArticlesRepository extends articles_repository_1.ArticlesRepository {
    prisma;
    mapper = new articles_mapper_1.ArticlesMapper();
    constructor(prisma) {
        super();
        this.prisma = prisma;
    }
    client(tx) {
        return tx ?? this.prisma;
    }
    toPrismaDecimal(d) {
        return new client_1.Prisma.Decimal(d.toFixed());
    }
    async create(input, currency, tx) {
        const row = await this.client(tx).article.create({
            data: {
                organizationId: input.organizationId,
                sku: input.sku,
                name: input.name,
                purchasePrice: this.toPrismaDecimal(input.purchasePrice),
                salePrice: this.toPrismaDecimal(input.salePrice),
                unit: input.unit,
                categoryId: input.categoryId,
                supplierId: input.supplierId ?? null,
                thresholdWarning: this.toPrismaDecimal(input.thresholdWarning),
                thresholdCritical: this.toPrismaDecimal(input.thresholdCritical),
                createdById: input.createdById,
            },
        });
        return this.mapper.toDomain(row, currency);
    }
    async findById(id, currency, tx) {
        const row = await this.client(tx).article.findUnique({ where: { id } });
        return row ? this.mapper.toDomain(row, currency) : null;
    }
    async list(filter, currency, tx) {
        const where = {
            organizationId: filter.organizationId,
            ...(0, where_not_deleted_1.whereNotDeleted)(),
        };
        if (filter.categoryId)
            where.categoryId = filter.categoryId;
        if (filter.search) {
            const q = filter.search.trim();
            where.OR = [
                { name: { contains: q, mode: 'insensitive' } },
                { sku: { contains: q, mode: 'insensitive' } },
            ];
        }
        const rows = await this.client(tx).article.findMany({
            where,
            orderBy: { name: 'asc' },
        });
        return rows.map((r) => this.mapper.toDomain(r, currency));
    }
    async update(id, patch, currency, tx) {
        const data = {};
        if (patch.sku !== undefined)
            data.sku = patch.sku;
        if (patch.name !== undefined)
            data.name = patch.name;
        if (patch.purchasePrice !== undefined)
            data.purchasePrice = this.toPrismaDecimal(patch.purchasePrice);
        if (patch.salePrice !== undefined)
            data.salePrice = this.toPrismaDecimal(patch.salePrice);
        if (patch.unit !== undefined)
            data.unit = patch.unit;
        if (patch.categoryId !== undefined)
            data.category = { connect: { id: patch.categoryId } };
        if (patch.supplierId !== undefined) {
            data.supplier =
                patch.supplierId === null ? { disconnect: true } : { connect: { id: patch.supplierId } };
        }
        if (patch.thresholdWarning !== undefined) {
            data.thresholdWarning = this.toPrismaDecimal(patch.thresholdWarning);
        }
        if (patch.thresholdCritical !== undefined) {
            data.thresholdCritical = this.toPrismaDecimal(patch.thresholdCritical);
        }
        const row = await this.client(tx).article.update({
            where: { id },
            data,
        });
        return this.mapper.toDomain(row, currency);
    }
    async softDelete(id, currency, tx) {
        const row = await this.client(tx).article.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
        return this.mapper.toDomain(row, currency);
    }
    async existsBySku(organizationId, sku, tx) {
        const row = await this.client(tx).article.findUnique({
            where: { organizationId_sku: { organizationId, sku } },
        });
        return !!row;
    }
};
exports.PrismaArticlesRepository = PrismaArticlesRepository;
exports.PrismaArticlesRepository = PrismaArticlesRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaArticlesRepository);
//# sourceMappingURL=articles.repository.js.map