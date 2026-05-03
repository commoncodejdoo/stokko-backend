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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const dashboard_service_1 = require("../../domain/dashboard/dashboard.service");
const current_user_decorator_1 = require("../common/auth/current-user.decorator");
const jwt_auth_guard_1 = require("../common/auth/jwt-auth.guard");
let DashboardController = class DashboardController {
    service;
    constructor(service) {
        this.service = service;
    }
    async overview(ctx) {
        const data = await this.service.getOverview(ctx.organizationId);
        return this.toPublic(data);
    }
    toPublic(d) {
        return {
            counts: d.counts,
            perWarehouse: d.perWarehouse.map((w) => this.warehouseToPublic(w)),
            recentActivity: d.recentActivity.map((a) => this.activityToPublic(a)),
        };
    }
    warehouseToPublic(w) {
        return {
            warehouseId: w.warehouseId,
            name: w.name,
            color: w.color,
            initials: w.initials,
            articleCount: w.articleCount,
            totalQuantity: w.totalQuantity.toFixed(3),
            totalValue: w.totalValue.toFixed(2),
            currency: w.currency,
        };
    }
    activityToPublic(a) {
        return {
            id: a.id,
            action: a.action,
            entityType: a.entityType,
            entityId: a.entityId,
            user: a.user,
            before: a.before,
            after: a.after,
            createdAt: a.createdAt.toISOString(),
        };
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "overview", null);
exports.DashboardController = DashboardController = __decorate([
    (0, common_1.Controller)('dashboard'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [dashboard_service_1.DashboardService])
], DashboardController);
//# sourceMappingURL=dashboard.controller.js.map