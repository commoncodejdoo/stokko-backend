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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticlesController = void 0;
const common_1 = require("@nestjs/common");
const articles_service_1 = require("../../domain/articles/articles.service");
const audit_log_service_1 = require("../../domain/audit-log/audit-log.service");
const role_1 = require("../../domain/common/role");
const stock_status_1 = require("../../domain/common/stock-status");
const stock_service_1 = require("../../domain/stock/stock.service");
const users_service_1 = require("../../domain/users/users.service");
const current_user_decorator_1 = require("../common/auth/current-user.decorator");
const jwt_auth_guard_1 = require("../common/auth/jwt-auth.guard");
const roles_decorator_1 = require("../common/auth/roles.decorator");
const roles_guard_1 = require("../common/auth/roles.guard");
const articles_dto_1 = require("./articles.dto");
let ArticlesController = class ArticlesController {
    service;
    stock;
    auditLog;
    users;
    constructor(service, stock, auditLog, users) {
        this.service = service;
        this.stock = stock;
        this.auditLog = auditLog;
        this.users = users;
    }
    async list(q, ctx) {
        const articles = await this.service.list({
            organizationId: ctx.organizationId,
            search: q.q,
            categoryId: q.categoryId,
            supplierId: q.supplierId,
        });
        const result = [];
        for (const a of articles) {
            const stock = await this.stock.getByArticle(a.id);
            const overall = this.overallStatus(a, stock);
            if (q.status === 'low' && overall === stock_status_1.StockStatus.OK)
                continue;
            result.push(this.toListItem(a, stock, overall));
        }
        return { items: result };
    }
    async detail(id, ctx) {
        const { article, stock } = await this.service.getWithStock(id, ctx.organizationId);
        return this.toDetail(article, stock);
    }
    async create(body, ctx) {
        const { article, stock } = await this.service.create(body, ctx);
        return this.toDetail(article, stock);
    }
    async update(id, body, ctx) {
        const article = await this.service.update(id, body, ctx);
        const stock = await this.stock.getByArticle(article.id);
        return this.toDetail(article, stock);
    }
    async delete(id, ctx) {
        await this.service.softDelete(id, ctx);
    }
    async history(id, pageParam, pageSizeParam, ctx) {
        await this.service.requireById(id, ctx.organizationId);
        const page = pageParam ? Number(pageParam) : 1;
        const pageSize = pageSizeParam ? Number(pageSizeParam) : 50;
        const { items, total } = await this.auditLog.listArticleHistory(ctx.organizationId, id, page, pageSize);
        const userIds = new Set(items.map((e) => e.userId));
        const users = userIds.size
            ? await this.users.listByOrg(ctx.organizationId)
            : [];
        const userById = new Map(users.filter((u) => userIds.has(u.id)).map((u) => [u.id, u]));
        return {
            items: items.map((e) => {
                const u = userById.get(e.userId);
                return {
                    id: e.id,
                    action: e.action,
                    entityType: e.entityType,
                    entityId: e.entityId,
                    userId: e.userId,
                    user: u
                        ? {
                            id: u.id,
                            firstName: u.firstName,
                            lastName: u.lastName,
                            fullName: u.fullName(),
                            initials: u.initials(),
                        }
                        : null,
                    before: e.before,
                    after: e.after,
                    createdAt: e.createdAt.toISOString(),
                };
            }),
            pagination: { page, pageSize, total },
        };
    }
    overallStatus(a, stock) {
        if (stock.length === 0)
            return stock_status_1.StockStatus.UNKNOWN;
        let worst = stock_status_1.StockStatus.OK;
        for (const e of stock) {
            const s = a.status(e.quantity);
            if (s === stock_status_1.StockStatus.CRITICAL)
                return stock_status_1.StockStatus.CRITICAL;
            if (s === stock_status_1.StockStatus.WARNING)
                worst = stock_status_1.StockStatus.WARNING;
        }
        return worst;
    }
    toListItem(a, stock, overall) {
        const totalQty = stock.reduce((sum, e) => sum + Number(e.quantity.toFixed(3)), 0);
        return {
            id: a.id,
            sku: a.sku,
            name: a.name,
            unit: a.unit,
            categoryId: a.categoryId,
            supplierId: a.supplierId,
            purchasePrice: a.purchasePrice.toFixed(),
            salePrice: a.salePrice.toFixed(),
            currency: a.purchasePrice.currency,
            thresholdWarning: a.thresholdWarning.toFixed(3),
            thresholdCritical: a.thresholdCritical.toFixed(3),
            totalQuantity: totalQty.toFixed(3),
            status: overall,
        };
    }
    toDetail(a, stock) {
        const overall = this.overallStatus(a, stock);
        return {
            ...this.toListItem(a, stock, overall),
            stockByWarehouse: stock.map((e) => ({
                warehouseId: e.warehouseId,
                quantity: e.quantity.toFixed(3),
                status: a.status(e.quantity),
            })),
        };
    }
};
exports.ArticlesController = ArticlesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [articles_dto_1.ListArticlesQueryDto, Object]),
    __metadata("design:returntype", Promise)
], ArticlesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ArticlesController.prototype, "detail", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(role_1.Role.OWNER, role_1.Role.ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [articles_dto_1.CreateArticleDto, Object]),
    __metadata("design:returntype", Promise)
], ArticlesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(role_1.Role.OWNER, role_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, articles_dto_1.UpdateArticleDto, Object]),
    __metadata("design:returntype", Promise)
], ArticlesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(role_1.Role.OWNER, role_1.Role.ADMIN),
    (0, common_1.HttpCode)(204),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ArticlesController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)(':id/history'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('pageSize')),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ArticlesController.prototype, "history", null);
exports.ArticlesController = ArticlesController = __decorate([
    (0, common_1.Controller)('articles'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [articles_service_1.ArticlesService,
        stock_service_1.StockService,
        audit_log_service_1.AuditLogService,
        users_service_1.UsersService])
], ArticlesController);
//# sourceMappingURL=articles.controller.js.map