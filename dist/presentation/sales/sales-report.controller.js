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
exports.SalesReportController = void 0;
const common_1 = require("@nestjs/common");
const role_1 = require("../../domain/common/role");
const sales_report_service_1 = require("../../domain/sales/sales-report.service");
const current_user_decorator_1 = require("../common/auth/current-user.decorator");
const jwt_auth_guard_1 = require("../common/auth/jwt-auth.guard");
const roles_decorator_1 = require("../common/auth/roles.decorator");
const roles_guard_1 = require("../common/auth/roles.guard");
const sales_report_dto_1 = require("./sales-report.dto");
let SalesReportController = class SalesReportController {
    service;
    constructor(service) {
        this.service = service;
    }
    async report(q, ctx) {
        const offset = q.offset ? Number(q.offset) : 0;
        const report = await this.service.getReport(ctx.organizationId, q.period, offset);
        return this.toPublic(report);
    }
    toPublic(r) {
        return {
            period: {
                kind: r.period.kind,
                offset: r.period.offset,
                from: r.period.from.toISOString(),
                to: r.period.to.toISOString(),
                label: r.period.label,
            },
            totals: r.totals,
            byDate: r.byDate,
            byArticle: r.byArticle,
            shifts: r.shifts,
        };
    }
};
exports.SalesReportController = SalesReportController;
__decorate([
    (0, common_1.Get)('report'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [sales_report_dto_1.SalesReportQueryDto, Object]),
    __metadata("design:returntype", Promise)
], SalesReportController.prototype, "report", null);
exports.SalesReportController = SalesReportController = __decorate([
    (0, common_1.Controller)('sales'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(role_1.Role.OWNER, role_1.Role.ADMIN),
    __metadata("design:paramtypes", [sales_report_service_1.SalesReportService])
], SalesReportController);
//# sourceMappingURL=sales-report.controller.js.map