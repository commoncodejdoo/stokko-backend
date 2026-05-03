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
exports.ProcurementsController = void 0;
const common_1 = require("@nestjs/common");
const procurements_service_1 = require("../../domain/procurements/procurements.service");
const current_user_decorator_1 = require("../common/auth/current-user.decorator");
const jwt_auth_guard_1 = require("../common/auth/jwt-auth.guard");
const procurements_dto_1 = require("./procurements.dto");
let ProcurementsController = class ProcurementsController {
    service;
    constructor(service) {
        this.service = service;
    }
    async list(q, ctx) {
        const page = q.page ? Number(q.page) : 1;
        const pageSize = q.pageSize ? Number(q.pageSize) : 50;
        const { items, total } = await this.service.list({
            organizationId: ctx.organizationId,
            supplierId: q.supplierId,
            warehouseId: q.warehouseId,
            page,
            pageSize,
        });
        return {
            items: items.map((p) => this.toPublic(p)),
            pagination: { page, pageSize, total },
        };
    }
    async detail(id, ctx) {
        const p = await this.service.findById(id, ctx.organizationId);
        return this.toPublic(p);
    }
    async create(body, ctx) {
        const p = await this.service.create(body, ctx);
        return this.toPublic(p);
    }
    toPublic(p) {
        const total = p.totalValue();
        return {
            id: p.id,
            supplierId: p.supplierId,
            warehouseId: p.warehouseId,
            createdById: p.createdById,
            note: p.note,
            createdAt: p.createdAt.toISOString(),
            currency: p.currency,
            totalValue: total.toFixed(),
            items: p.items.map((i) => ({
                id: i.id,
                articleId: i.articleId,
                quantity: i.quantity.toFixed(3),
                purchasePrice: i.purchasePrice.toFixed(),
                lineTotal: i.lineTotal().toFixed(),
            })),
        };
    }
};
exports.ProcurementsController = ProcurementsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [procurements_dto_1.ListProcurementsQueryDto, Object]),
    __metadata("design:returntype", Promise)
], ProcurementsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProcurementsController.prototype, "detail", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [procurements_dto_1.CreateProcurementDto, Object]),
    __metadata("design:returntype", Promise)
], ProcurementsController.prototype, "create", null);
exports.ProcurementsController = ProcurementsController = __decorate([
    (0, common_1.Controller)('procurements'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [procurements_service_1.ProcurementsService])
], ProcurementsController);
//# sourceMappingURL=procurements.controller.js.map