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
exports.PrismaStockRepository = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const decimal_js_1 = require("decimal.js");
const errors_1 = require("../../domain/common/errors");
const stock_entry_domain_1 = require("../../domain/stock/stock-entry.domain");
const stock_repository_1 = require("../../domain/stock/stock.repository");
const prisma_service_1 = require("../common/prisma/prisma.service");
let PrismaStockRepository = class PrismaStockRepository extends stock_repository_1.StockRepository {
    prisma;
    constructor(prisma) {
        super();
        this.prisma = prisma;
    }
    client(tx) {
        return tx ?? this.prisma;
    }
    toDomain(row) {
        return new stock_entry_domain_1.StockEntry(row.articleId, row.warehouseId, new decimal_js_1.Decimal(row.quantity.toString()), row.updatedAt);
    }
    async findByArticle(articleId, tx) {
        const rows = await this.client(tx).stockEntry.findMany({
            where: { articleId },
        });
        return rows.map((r) => this.toDomain(r));
    }
    async findByWarehouse(warehouseId, tx) {
        const rows = await this.client(tx).stockEntry.findMany({
            where: { warehouseId },
        });
        return rows.map((r) => this.toDomain(r));
    }
    async findByArticleAndWarehouse(articleId, warehouseId, tx) {
        const row = await this.client(tx).stockEntry.findUnique({
            where: { articleId_warehouseId: { articleId, warehouseId } },
        });
        return row ? this.toDomain(row) : null;
    }
    async setQuantity(articleId, warehouseId, quantity, tx) {
        const row = await this.client(tx).stockEntry.upsert({
            where: { articleId_warehouseId: { articleId, warehouseId } },
            create: {
                articleId,
                warehouseId,
                quantity: new client_1.Prisma.Decimal(quantity.toFixed()),
            },
            update: {
                quantity: new client_1.Prisma.Decimal(quantity.toFixed()),
            },
        });
        return this.toDomain(row);
    }
    async increment(articleId, warehouseId, delta, tx) {
        const client = this.client(tx);
        const existing = await client.stockEntry.findUnique({
            where: { articleId_warehouseId: { articleId, warehouseId } },
        });
        if (existing) {
            const current = new decimal_js_1.Decimal(existing.quantity.toString());
            const next = current.plus(delta);
            if (next.isNegative()) {
                throw new errors_1.DomainValidationError(`Stock would go negative (${current.toFixed()} + ${delta.toFixed()})`, { articleId, warehouseId, current: current.toFixed(), delta: delta.toFixed() });
            }
            const row = await client.stockEntry.update({
                where: { articleId_warehouseId: { articleId, warehouseId } },
                data: { quantity: new client_1.Prisma.Decimal(next.toFixed()) },
            });
            return this.toDomain(row);
        }
        if (delta.isNegative()) {
            throw new errors_1.DomainValidationError('Cannot decrement non-existent stock entry', { articleId, warehouseId, delta: delta.toFixed() });
        }
        const row = await client.stockEntry.create({
            data: {
                articleId,
                warehouseId,
                quantity: new client_1.Prisma.Decimal(delta.toFixed()),
            },
        });
        return this.toDomain(row);
    }
};
exports.PrismaStockRepository = PrismaStockRepository;
exports.PrismaStockRepository = PrismaStockRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaStockRepository);
//# sourceMappingURL=stock.repository.js.map