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
exports.WarehousesController = void 0;
const common_1 = require("@nestjs/common");
const decimal_js_1 = require("decimal.js");
const articles_service_1 = require("../../domain/articles/articles.service");
const role_1 = require("../../domain/common/role");
const stock_status_1 = require("../../domain/common/stock-status");
const organizations_service_1 = require("../../domain/organizations/organizations.service");
const stock_service_1 = require("../../domain/stock/stock.service");
const warehouses_service_1 = require("../../domain/warehouses/warehouses.service");
const current_user_decorator_1 = require("../common/auth/current-user.decorator");
const jwt_auth_guard_1 = require("../common/auth/jwt-auth.guard");
const roles_decorator_1 = require("../common/auth/roles.decorator");
const roles_guard_1 = require("../common/auth/roles.guard");
const warehouses_dto_1 = require("./warehouses.dto");
let WarehousesController = class WarehousesController {
    service;
    articles;
    stock;
    orgs;
    constructor(service, articles, stock, orgs) {
        this.service = service;
        this.articles = articles;
        this.stock = stock;
        this.orgs = orgs;
    }
    async list(ctx) {
        const items = await this.service.list(ctx.organizationId);
        return { items: items.map((w) => this.toPublic(w)) };
    }
    async detail(id, ctx) {
        const wh = await this.service.requireById(id, ctx.organizationId);
        return this.toPublic(wh);
    }
    async create(body, ctx) {
        const wh = await this.service.create(body, ctx);
        return this.toPublic(wh);
    }
    async update(id, body, ctx) {
        const wh = await this.service.update(id, body, ctx);
        return this.toPublic(wh);
    }
    async delete(id, ctx) {
        await this.service.softDelete(id, ctx);
    }
    async listArticles(id, ctx) {
        await this.service.requireById(id, ctx.organizationId);
        const [stockEntries, allArticles] = await Promise.all([
            this.stock.getByWarehouse(id),
            this.articles.list({ organizationId: ctx.organizationId }),
        ]);
        const articleById = new Map(allArticles.map((a) => [a.id, a]));
        const items = [];
        let totalQuantity = new decimal_js_1.Decimal(0);
        let totalValue = new decimal_js_1.Decimal(0);
        let articleCount = 0;
        for (const entry of stockEntries) {
            const a = articleById.get(entry.articleId);
            if (!a)
                continue;
            const status = (0, stock_status_1.computeStockStatus)(entry.quantity, a.thresholdWarning, a.thresholdCritical);
            items.push({
                articleId: a.id,
                sku: a.sku,
                name: a.name,
                unit: a.unit,
                categoryId: a.categoryId,
                supplierId: a.supplierId,
                quantity: entry.quantity.toFixed(3),
                status,
                purchasePrice: a.purchasePrice.toFixed(),
                currency: a.purchasePrice.currency,
            });
            if (!entry.quantity.isZero()) {
                articleCount += 1;
                totalQuantity = totalQuantity.plus(entry.quantity);
                totalValue = totalValue.plus(entry.quantity.times(a.purchasePrice.amount));
            }
        }
        items.sort((x, y) => x.name.localeCompare(y.name, 'hr'));
        const org = await this.orgs.requireById(ctx.organizationId);
        return {
            items,
            summary: {
                articleCount,
                totalQuantity: totalQuantity.toFixed(3),
                totalValue: totalValue.toFixed(2),
                currency: org.currency,
            },
        };
    }
    toPublic(wh) {
        return {
            id: wh.id,
            name: wh.name,
            color: wh.color,
            kind: wh.kind,
            initials: wh.initials(),
        };
    }
};
exports.WarehousesController = WarehousesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WarehousesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WarehousesController.prototype, "detail", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(role_1.Role.OWNER, role_1.Role.ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [warehouses_dto_1.CreateWarehouseDto, Object]),
    __metadata("design:returntype", Promise)
], WarehousesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(role_1.Role.OWNER, role_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, warehouses_dto_1.UpdateWarehouseDto, Object]),
    __metadata("design:returntype", Promise)
], WarehousesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(role_1.Role.OWNER, role_1.Role.ADMIN),
    (0, common_1.HttpCode)(204),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WarehousesController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)(':id/articles'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WarehousesController.prototype, "listArticles", null);
exports.WarehousesController = WarehousesController = __decorate([
    (0, common_1.Controller)('warehouses'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [warehouses_service_1.WarehousesService,
        articles_service_1.ArticlesService,
        stock_service_1.StockService,
        organizations_service_1.OrganizationsService])
], WarehousesController);
//# sourceMappingURL=warehouses.controller.js.map