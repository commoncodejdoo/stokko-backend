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
exports.CorrectionsService = void 0;
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
const correction_domain_1 = require("./correction.domain");
const corrections_repository_1 = require("./corrections.repository");
let CorrectionsService = class CorrectionsService {
    repo;
    orgs;
    articles;
    warehouses;
    stock;
    auditLog;
    prisma;
    constructor(repo, orgs, articles, warehouses, stock, auditLog, prisma) {
        this.repo = repo;
        this.orgs = orgs;
        this.articles = articles;
        this.warehouses = warehouses;
        this.stock = stock;
        this.auditLog = auditLog;
        this.prisma = prisma;
    }
    async create(cmd, ctx) {
        return this.prisma.$transaction(async (tx) => {
            await this.orgs.requireById(ctx.organizationId, tx);
            await this.articles.requireById(cmd.articleId, ctx.organizationId, tx);
            await this.warehouses.requireById(cmd.warehouseId, ctx.organizationId, tx);
            const value = new decimal_js_1.Decimal(cmd.value);
            const tempCorrection = new correction_domain_1.StockCorrection('pending', ctx.organizationId, cmd.articleId, cmd.warehouseId, cmd.type, value, cmd.reason, cmd.note ?? null, ctx.userId, new Date());
            const existing = await this.stock.getByArticleAndWarehouse(cmd.articleId, cmd.warehouseId, tx);
            const currentQty = existing?.quantity ?? new decimal_js_1.Decimal(0);
            const nextQty = tempCorrection.applyTo(currentQty);
            if (nextQty.isNegative()) {
                throw new errors_1.DomainValidationError(`Stock would go negative (${currentQty.toFixed()} → ${nextQty.toFixed()})`, {
                    articleId: cmd.articleId,
                    warehouseId: cmd.warehouseId,
                    current: currentQty.toFixed(),
                    attempted: nextQty.toFixed(),
                });
            }
            const created = await this.repo.create({
                organizationId: ctx.organizationId,
                articleId: cmd.articleId,
                warehouseId: cmd.warehouseId,
                type: cmd.type,
                value,
                reason: cmd.reason,
                note: cmd.note ?? null,
                createdById: ctx.userId,
            }, tx);
            if (cmd.type === correction_domain_1.CorrectionType.ABSOLUTE) {
                await this.stock.setQuantity(cmd.articleId, cmd.warehouseId, nextQty, tx);
            }
            else {
                await this.stock.increment(cmd.articleId, cmd.warehouseId, value, tx);
            }
            await this.auditLog.record({
                organizationId: ctx.organizationId,
                userId: ctx.userId,
                action: audit_action_1.AuditAction.CORRECTION_CREATED,
                entityType: 'StockCorrection',
                entityId: created.id,
                before: {
                    articleId: cmd.articleId,
                    warehouseId: cmd.warehouseId,
                    qty: currentQty.toFixed(3),
                },
                after: {
                    articleId: cmd.articleId,
                    warehouseId: cmd.warehouseId,
                    qty: nextQty.toFixed(3),
                    correction: created.toSnapshot(),
                },
            }, tx);
            return created;
        });
    }
    async findById(id, organizationId, tx) {
        const c = await this.repo.findById(id, tx);
        if (!c)
            throw new errors_1.EntityNotFoundError('StockCorrection', id);
        if (c.organizationId !== organizationId) {
            throw new errors_1.CrossOrgAccessError('StockCorrection', id);
        }
        return c;
    }
    async list(filter, tx) {
        return this.repo.list(filter, tx);
    }
};
exports.CorrectionsService = CorrectionsService;
exports.CorrectionsService = CorrectionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [corrections_repository_1.CorrectionsRepository,
        organizations_service_1.OrganizationsService,
        articles_service_1.ArticlesService,
        warehouses_service_1.WarehousesService,
        stock_service_1.StockService,
        audit_log_service_1.AuditLogService,
        prisma_service_1.PrismaService])
], CorrectionsService);
//# sourceMappingURL=corrections.service.js.map