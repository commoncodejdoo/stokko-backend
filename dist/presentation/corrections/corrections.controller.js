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
exports.CorrectionsController = void 0;
const common_1 = require("@nestjs/common");
const corrections_service_1 = require("../../domain/corrections/corrections.service");
const current_user_decorator_1 = require("../common/auth/current-user.decorator");
const jwt_auth_guard_1 = require("../common/auth/jwt-auth.guard");
const corrections_dto_1 = require("./corrections.dto");
let CorrectionsController = class CorrectionsController {
    service;
    constructor(service) {
        this.service = service;
    }
    async list(q, ctx) {
        const page = q.page ? Number(q.page) : 1;
        const pageSize = q.pageSize ? Number(q.pageSize) : 50;
        const { items, total } = await this.service.list({
            organizationId: ctx.organizationId,
            articleId: q.articleId,
            warehouseId: q.warehouseId,
            page,
            pageSize,
        });
        return {
            items: items.map((c) => this.toPublic(c)),
            pagination: { page, pageSize, total },
        };
    }
    async detail(id, ctx) {
        const c = await this.service.findById(id, ctx.organizationId);
        return this.toPublic(c);
    }
    async create(body, ctx) {
        const c = await this.service.create(body, ctx);
        return this.toPublic(c);
    }
    toPublic(c) {
        return {
            id: c.id,
            articleId: c.articleId,
            warehouseId: c.warehouseId,
            type: c.type,
            value: c.value.toFixed(3),
            reason: c.reason,
            note: c.note,
            createdById: c.createdById,
            createdAt: c.createdAt.toISOString(),
        };
    }
};
exports.CorrectionsController = CorrectionsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [corrections_dto_1.ListCorrectionsQueryDto, Object]),
    __metadata("design:returntype", Promise)
], CorrectionsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CorrectionsController.prototype, "detail", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [corrections_dto_1.CreateCorrectionDto, Object]),
    __metadata("design:returntype", Promise)
], CorrectionsController.prototype, "create", null);
exports.CorrectionsController = CorrectionsController = __decorate([
    (0, common_1.Controller)('stock/corrections'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [corrections_service_1.CorrectionsService])
], CorrectionsController);
//# sourceMappingURL=corrections.controller.js.map