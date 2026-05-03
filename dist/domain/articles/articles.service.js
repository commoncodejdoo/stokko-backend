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
exports.ArticlesService = void 0;
const common_1 = require("@nestjs/common");
const decimal_js_1 = require("decimal.js");
const audit_log_service_1 = require("../audit-log/audit-log.service");
const categories_service_1 = require("../categories/categories.service");
const audit_action_1 = require("../common/audit-action");
const errors_1 = require("../common/errors");
const money_1 = require("../common/money");
const organizations_service_1 = require("../organizations/organizations.service");
const stock_service_1 = require("../stock/stock.service");
const suppliers_service_1 = require("../suppliers/suppliers.service");
const warehouses_service_1 = require("../warehouses/warehouses.service");
const article_domain_1 = require("./article.domain");
const articles_repository_1 = require("./articles.repository");
let ArticlesService = class ArticlesService {
    repo;
    orgs;
    categories;
    suppliers;
    warehouses;
    stock;
    auditLog;
    constructor(repo, orgs, categories, suppliers, warehouses, stock, auditLog) {
        this.repo = repo;
        this.orgs = orgs;
        this.categories = categories;
        this.suppliers = suppliers;
        this.warehouses = warehouses;
        this.stock = stock;
        this.auditLog = auditLog;
    }
    async findById(id, organizationId, tx) {
        const org = await this.orgs.requireById(organizationId, tx);
        const article = await this.repo.findById(id, org.currency, tx);
        if (!article)
            return null;
        if (article.organizationId !== organizationId) {
            throw new errors_1.CrossOrgAccessError('Article', id);
        }
        return article;
    }
    async requireById(id, organizationId, tx) {
        const article = await this.findById(id, organizationId, tx);
        if (!article || article.isDeleted())
            throw new errors_1.EntityNotFoundError('Article', id);
        return article;
    }
    async list(filter, tx) {
        const org = await this.orgs.requireById(filter.organizationId, tx);
        return this.repo.list(filter, org.currency, tx);
    }
    async getWithStock(id, organizationId, tx) {
        const article = await this.requireById(id, organizationId, tx);
        const stock = await this.stock.getByArticle(article.id, tx);
        return { article, stock };
    }
    async create(cmd, ctx, tx) {
        const org = await this.orgs.requireById(ctx.organizationId, tx);
        await this.categories.requireById(cmd.categoryId, ctx.organizationId, tx);
        if (cmd.supplierId) {
            await this.suppliers.requireById(cmd.supplierId, ctx.organizationId, tx);
        }
        if (await this.repo.existsBySku(ctx.organizationId, cmd.sku, tx)) {
            throw new errors_1.DomainValidationError(`SKU "${cmd.sku}" already exists in this organization`, {
                sku: cmd.sku,
            });
        }
        const input = {
            organizationId: ctx.organizationId,
            sku: cmd.sku.trim(),
            name: cmd.name.trim(),
            purchasePrice: new decimal_js_1.Decimal(cmd.purchasePrice),
            salePrice: new decimal_js_1.Decimal(cmd.salePrice),
            unit: cmd.unit,
            categoryId: cmd.categoryId,
            supplierId: cmd.supplierId ?? null,
            thresholdWarning: new decimal_js_1.Decimal(cmd.thresholdWarning),
            thresholdCritical: new decimal_js_1.Decimal(cmd.thresholdCritical),
            createdById: ctx.userId,
        };
        const created = await this.repo.create(input, org.currency, tx);
        const initialStock = [];
        if (cmd.initialStock?.length) {
            for (const seed of cmd.initialStock) {
                await this.warehouses.requireById(seed.warehouseId, ctx.organizationId, tx);
                const entry = await this.stock.setQuantity(created.id, seed.warehouseId, new decimal_js_1.Decimal(seed.quantity), tx);
                initialStock.push(entry);
            }
        }
        await this.auditLog.record({
            organizationId: ctx.organizationId,
            userId: ctx.userId,
            action: audit_action_1.AuditAction.ARTICLE_CREATED,
            entityType: 'Article',
            entityId: created.id,
            before: null,
            after: created.toSnapshot(),
        }, tx);
        return { article: created, stock: initialStock };
    }
    async update(id, cmd, ctx, tx) {
        const org = await this.orgs.requireById(ctx.organizationId, tx);
        const before = await this.requireById(id, ctx.organizationId, tx);
        if (cmd.categoryId) {
            await this.categories.requireById(cmd.categoryId, ctx.organizationId, tx);
        }
        if (cmd.supplierId) {
            await this.suppliers.requireById(cmd.supplierId, ctx.organizationId, tx);
        }
        if (cmd.sku && cmd.sku !== before.sku) {
            if (await this.repo.existsBySku(ctx.organizationId, cmd.sku, tx)) {
                throw new errors_1.DomainValidationError(`SKU "${cmd.sku}" already exists in this organization`, {
                    sku: cmd.sku,
                });
            }
        }
        const patch = {};
        if (cmd.sku !== undefined)
            patch.sku = cmd.sku.trim();
        if (cmd.name !== undefined)
            patch.name = cmd.name.trim();
        if (cmd.purchasePrice !== undefined) {
            patch.purchasePrice = new decimal_js_1.Decimal(cmd.purchasePrice);
        }
        if (cmd.salePrice !== undefined) {
            patch.salePrice = new decimal_js_1.Decimal(cmd.salePrice);
        }
        if (cmd.unit !== undefined)
            patch.unit = cmd.unit;
        if (cmd.categoryId !== undefined)
            patch.categoryId = cmd.categoryId;
        if (cmd.supplierId !== undefined)
            patch.supplierId = cmd.supplierId;
        if (cmd.thresholdWarning !== undefined) {
            patch.thresholdWarning = new decimal_js_1.Decimal(cmd.thresholdWarning);
        }
        if (cmd.thresholdCritical !== undefined) {
            patch.thresholdCritical = new decimal_js_1.Decimal(cmd.thresholdCritical);
        }
        const updated = await this.repo.update(id, patch, org.currency, tx);
        new article_domain_1.Article(updated.id, updated.organizationId, updated.sku, updated.name, updated.purchasePrice, updated.salePrice, updated.unit, updated.categoryId, updated.supplierId, updated.thresholdWarning, updated.thresholdCritical, updated.createdById, updated.deletedAt, updated.createdAt, updated.updatedAt);
        await this.auditLog.record({
            organizationId: ctx.organizationId,
            userId: ctx.userId,
            action: audit_action_1.AuditAction.ARTICLE_UPDATED,
            entityType: 'Article',
            entityId: updated.id,
            before: before.toSnapshot(),
            after: updated.toSnapshot(),
        }, tx);
        return updated;
    }
    async softDelete(id, ctx, tx) {
        const org = await this.orgs.requireById(ctx.organizationId, tx);
        const before = await this.requireById(id, ctx.organizationId, tx);
        const deleted = await this.repo.softDelete(id, org.currency, tx);
        await this.auditLog.record({
            organizationId: ctx.organizationId,
            userId: ctx.userId,
            action: audit_action_1.AuditAction.ARTICLE_DELETED,
            entityType: 'Article',
            entityId: deleted.id,
            before: before.toSnapshot(),
            after: deleted.toSnapshot(),
        }, tx);
    }
    moneyFromDecimal(amount, currency) {
        return new money_1.Money(amount, currency);
    }
};
exports.ArticlesService = ArticlesService;
exports.ArticlesService = ArticlesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [articles_repository_1.ArticlesRepository,
        organizations_service_1.OrganizationsService,
        categories_service_1.CategoriesService,
        suppliers_service_1.SuppliersService,
        warehouses_service_1.WarehousesService,
        stock_service_1.StockService,
        audit_log_service_1.AuditLogService])
], ArticlesService);
//# sourceMappingURL=articles.service.js.map