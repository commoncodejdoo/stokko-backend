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
exports.ShiftsController = void 0;
const common_1 = require("@nestjs/common");
const role_1 = require("../../domain/common/role");
const sales_service_1 = require("../../domain/sales/sales.service");
const current_user_decorator_1 = require("../common/auth/current-user.decorator");
const jwt_auth_guard_1 = require("../common/auth/jwt-auth.guard");
const roles_decorator_1 = require("../common/auth/roles.decorator");
const roles_guard_1 = require("../common/auth/roles.guard");
const sales_dto_1 = require("./sales.dto");
let ShiftsController = class ShiftsController {
    service;
    constructor(service) {
        this.service = service;
    }
    async list(q, ctx) {
        const page = q.page ? Number(q.page) : 1;
        const pageSize = q.pageSize ? Number(q.pageSize) : 50;
        const { items, total } = await this.service.listShifts({
            organizationId: ctx.organizationId,
            page,
            pageSize,
        });
        return {
            items: items.map((s) => this.toShiftPublic(s)),
            pagination: { page, pageSize, total },
        };
    }
    async detail(id, ctx) {
        const { shift, sales } = await this.service.findShiftById(id, ctx.organizationId);
        return {
            ...this.toShiftPublic(shift),
            sales: sales.map((s) => this.toSalePublic(s)),
        };
    }
    async close(body, ctx) {
        const { shift, sales } = await this.service.closeShift(body, ctx);
        return {
            ...this.toShiftPublic(shift),
            sales: sales.map((s) => this.toSalePublic(s)),
        };
    }
    async remove(id, ctx) {
        await this.service.deleteShift(id, ctx.organizationId, ctx);
    }
    toShiftPublic(s) {
        return {
            id: s.id,
            date: s.date.toISOString(),
            openedAt: s.openedAt.toISOString(),
            closedAt: s.closedAt?.toISOString() ?? null,
            closedById: s.closedById,
            status: s.status,
            totalQuantity: s.totalQuantity.toFixed(3),
            totalRevenue: s.totalRevenue.toFixed(),
            currency: s.totalRevenue.currency,
        };
    }
    toSalePublic(s) {
        return {
            id: s.id,
            shiftId: s.shiftId,
            warehouseId: s.warehouseId,
            createdById: s.createdById,
            createdAt: s.createdAt.toISOString(),
            currency: s.currency,
            totalQuantity: s.totalQuantity().toFixed(3),
            totalRevenue: s.totalRevenue().toFixed(),
            items: s.items.map((i) => ({
                id: i.id,
                articleId: i.articleId,
                quantity: i.quantity.toFixed(3),
                unitPrice: i.unitPrice.toFixed(),
                lineTotal: i.lineTotal().toFixed(),
            })),
        };
    }
};
exports.ShiftsController = ShiftsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sales_dto_1.ListShiftsQueryDto, Object]),
    __metadata("design:returntype", Promise)
], ShiftsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ShiftsController.prototype, "detail", null);
__decorate([
    (0, common_1.Post)('close'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sales_dto_1.CloseShiftDto, Object]),
    __metadata("design:returntype", Promise)
], ShiftsController.prototype, "close", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(role_1.Role.OWNER, role_1.Role.ADMIN),
    (0, common_1.HttpCode)(204),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ShiftsController.prototype, "remove", null);
exports.ShiftsController = ShiftsController = __decorate([
    (0, common_1.Controller)('shifts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [sales_service_1.SalesService])
], ShiftsController);
//# sourceMappingURL=shifts.controller.js.map