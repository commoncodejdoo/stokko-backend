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
exports.PrismaSalesRepository = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const sales_repository_1 = require("../../domain/sales/sales.repository");
const prisma_service_1 = require("../common/prisma/prisma.service");
const sales_mapper_1 = require("./sales.mapper");
let PrismaSalesRepository = class PrismaSalesRepository extends sales_repository_1.SalesRepository {
    prisma;
    mapper = new sales_mapper_1.SalesMapper();
    constructor(prisma) {
        super();
        this.prisma = prisma;
    }
    client(tx) {
        return tx ?? this.prisma;
    }
    async upsertShift(input, tx) {
        const row = await this.client(tx).shift.upsert({
            where: {
                organizationId_date: {
                    organizationId: input.organizationId,
                    date: input.date,
                },
            },
            update: {},
            create: {
                organizationId: input.organizationId,
                date: input.date,
            },
        });
        return this.mapper.toShift(row, 'EUR');
    }
    async findShiftById(id, currency, tx) {
        const row = await this.client(tx).shift.findUnique({ where: { id } });
        return row ? this.mapper.toShift(row, currency) : null;
    }
    async findShiftWithSales(id, currency, tx) {
        const row = await this.client(tx).shift.findUnique({
            where: { id },
            include: { sales: { include: { items: true } } },
        });
        if (!row)
            return null;
        const shift = this.mapper.toShift(row, currency);
        const sales = row.sales.map((s) => this.mapper.toSale(s, currency));
        return { shift, sales };
    }
    async listShifts(filter, currency, tx) {
        const page = filter.page ?? 1;
        const pageSize = filter.pageSize ?? 50;
        const where = { organizationId: filter.organizationId };
        const client = this.client(tx);
        const [rows, total] = await Promise.all([
            client.shift.findMany({
                where,
                orderBy: { date: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            client.shift.count({ where }),
        ]);
        return {
            items: rows.map((r) => this.mapper.toShift(r, currency)),
            total,
        };
    }
    async createSale(input, currency, tx) {
        const row = await this.client(tx).sale.create({
            data: {
                organizationId: input.organizationId,
                shiftId: input.shiftId,
                warehouseId: input.warehouseId,
                createdById: input.createdById,
                items: {
                    create: input.items.map((i) => ({
                        articleId: i.articleId,
                        quantity: new client_1.Prisma.Decimal(i.quantity.toFixed()),
                        unitPrice: new client_1.Prisma.Decimal(i.unitPrice.toFixed()),
                    })),
                },
            },
            include: { items: true },
        });
        return this.mapper.toSale(row, currency);
    }
    async closeShift(input, currency, tx) {
        const row = await this.client(tx).shift.update({
            where: { id: input.shiftId },
            data: {
                status: 'CLOSED',
                closedAt: new Date(),
                closedById: input.closedById,
                totalQuantity: new client_1.Prisma.Decimal(input.totalQuantity.toFixed()),
                totalRevenue: new client_1.Prisma.Decimal(input.totalRevenueAmount.toFixed()),
            },
        });
        return this.mapper.toShift(row, currency);
    }
    async deleteShift(id, tx) {
        await this.client(tx).shift.delete({ where: { id } });
    }
};
exports.PrismaSalesRepository = PrismaSalesRepository;
exports.PrismaSalesRepository = PrismaSalesRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaSalesRepository);
//# sourceMappingURL=sales.repository.js.map