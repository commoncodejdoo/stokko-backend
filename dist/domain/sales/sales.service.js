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
exports.SalesService = void 0;
const common_1 = require("@nestjs/common");
const decimal_js_1 = require("decimal.js");
const articles_service_1 = require("../articles/articles.service");
const audit_log_service_1 = require("../audit-log/audit-log.service");
const audit_action_1 = require("../common/audit-action");
const errors_1 = require("../common/errors");
const organizations_service_1 = require("../organizations/organizations.service");
const stock_service_1 = require("../stock/stock.service");
const warehouses_service_1 = require("../warehouses/warehouses.service");
const prisma_service_1 = require("../../data/common/prisma/prisma.service");
const sales_repository_1 = require("./sales.repository");
let SalesService = class SalesService {
    repo;
    orgs;
    warehouses;
    articles;
    stock;
    auditLog;
    prisma;
    constructor(repo, orgs, warehouses, articles, stock, auditLog, prisma) {
        this.repo = repo;
        this.orgs = orgs;
        this.warehouses = warehouses;
        this.articles = articles;
        this.stock = stock;
        this.auditLog = auditLog;
        this.prisma = prisma;
    }
    async closeShift(cmd, ctx) {
        if (!cmd.items?.length) {
            throw new errors_1.DomainValidationError('At least one item is required');
        }
        return this.prisma.$transaction(async (tx) => {
            const org = await this.orgs.requireById(ctx.organizationId, tx);
            const today = todayUtcMidnight();
            let shift = await this.repo.upsertShift({ organizationId: ctx.organizationId, date: today }, tx);
            if (shift.isClosed()) {
                throw new errors_1.DomainValidationError('Smjena za današnji dan je već zatvorena', { shiftId: shift.id });
            }
            const buckets = new Map();
            let totalQty = new decimal_js_1.Decimal(0);
            let totalRevenue = new decimal_js_1.Decimal(0);
            for (const it of cmd.items) {
                const qty = new decimal_js_1.Decimal(it.quantity);
                if (qty.isNegative() || qty.isZero()) {
                    throw new errors_1.DomainValidationError('Sale item quantity must be > 0', {
                        articleId: it.articleId,
                        quantity: qty.toFixed(),
                    });
                }
                const wh = await this.warehouses.requireById(it.warehouseId, ctx.organizationId, tx);
                if (!wh.isFoh()) {
                    throw new errors_1.DomainValidationError('Smjena se može zatvoriti samo nad FOH skladištima', { warehouseId: wh.id, kind: wh.kind });
                }
                const article = await this.articles.requireById(it.articleId, ctx.organizationId, tx);
                const unitPrice = article.salePrice.amount;
                const lineTotal = unitPrice.times(qty);
                let bucket = buckets.get(wh.id);
                if (!bucket) {
                    bucket = { warehouseId: wh.id, items: [] };
                    buckets.set(wh.id, bucket);
                }
                bucket.items.push({ articleId: article.id, quantity: qty, unitPrice });
                await this.stock.increment(article.id, wh.id, qty.negated(), tx);
                totalQty = totalQty.plus(qty);
                totalRevenue = totalRevenue.plus(lineTotal);
            }
            const sales = [];
            for (const bucket of buckets.values()) {
                const sale = await this.repo.createSale({
                    organizationId: ctx.organizationId,
                    shiftId: shift.id,
                    warehouseId: bucket.warehouseId,
                    createdById: ctx.userId,
                    items: bucket.items,
                }, org.currency, tx);
                sales.push(sale);
                await this.auditLog.record({
                    organizationId: ctx.organizationId,
                    userId: ctx.userId,
                    action: audit_action_1.AuditAction.SALE_CREATED,
                    entityType: 'Sale',
                    entityId: sale.id,
                    before: null,
                    after: sale.toSnapshot(),
                }, tx);
            }
            shift = await this.repo.closeShift({
                shiftId: shift.id,
                closedById: ctx.userId,
                totalQuantity: totalQty,
                totalRevenueAmount: totalRevenue,
            }, org.currency, tx);
            await this.auditLog.record({
                organizationId: ctx.organizationId,
                userId: ctx.userId,
                action: audit_action_1.AuditAction.SHIFT_CLOSED,
                entityType: 'Shift',
                entityId: shift.id,
                before: null,
                after: shift.toSnapshot(),
            }, tx);
            return { shift, sales };
        });
    }
    async findShiftById(id, organizationId, tx) {
        const org = await this.orgs.requireById(organizationId, tx);
        const found = await this.repo.findShiftWithSales(id, org.currency, tx);
        if (!found)
            throw new errors_1.EntityNotFoundError('Shift', id);
        if (found.shift.organizationId !== organizationId) {
            throw new errors_1.CrossOrgAccessError('Shift', id);
        }
        return found;
    }
    async listShifts(filter, tx) {
        const org = await this.orgs.requireById(filter.organizationId, tx);
        return this.repo.listShifts(filter, org.currency, tx);
    }
    async deleteShift(id, organizationId, ctx, tx) {
        const found = await this.repo.findShiftById(id, 'EUR', tx);
        if (!found)
            throw new errors_1.EntityNotFoundError('Shift', id);
        if (found.organizationId !== organizationId) {
            throw new errors_1.CrossOrgAccessError('Shift', id);
        }
        await this.repo.deleteShift(id, tx);
        await this.auditLog.record({
            organizationId: ctx.organizationId,
            userId: ctx.userId,
            action: audit_action_1.AuditAction.SHIFT_CLOSED,
            entityType: 'Shift',
            entityId: id,
            before: found.toSnapshot(),
            after: null,
        }, tx);
    }
};
exports.SalesService = SalesService;
exports.SalesService = SalesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [sales_repository_1.SalesRepository,
        organizations_service_1.OrganizationsService,
        warehouses_service_1.WarehousesService,
        articles_service_1.ArticlesService,
        stock_service_1.StockService,
        audit_log_service_1.AuditLogService,
        prisma_service_1.PrismaService])
], SalesService);
function todayUtcMidnight() {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}
//# sourceMappingURL=sales.service.js.map