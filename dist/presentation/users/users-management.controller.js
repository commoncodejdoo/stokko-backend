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
exports.UsersManagementController = void 0;
const common_1 = require("@nestjs/common");
const errors_1 = require("../../domain/common/errors");
const role_1 = require("../../domain/common/role");
const users_service_1 = require("../../domain/users/users.service");
const current_user_decorator_1 = require("../common/auth/current-user.decorator");
const jwt_auth_guard_1 = require("../common/auth/jwt-auth.guard");
const roles_decorator_1 = require("../common/auth/roles.decorator");
const roles_guard_1 = require("../common/auth/roles.guard");
const users_dto_1 = require("./users.dto");
let UsersManagementController = class UsersManagementController {
    users;
    constructor(users) {
        this.users = users;
    }
    async list(ctx) {
        const users = await this.users.listByOrg(ctx.organizationId);
        return { items: users.map((u) => u.toPublic()) };
    }
    async invite(body, ctx) {
        const existing = await this.users.findByEmailInOrg(body.email, ctx.organizationId);
        if (existing) {
            throw new errors_1.DomainValidationError(`User with email "${body.email}" already exists in this organization`, { email: body.email });
        }
        const { user, temporaryPassword } = await this.users.invite({
            organizationId: ctx.organizationId,
            email: body.email,
            firstName: body.firstName.trim(),
            lastName: body.lastName.trim(),
            role: body.role,
        }, ctx.userId);
        return {
            user: user.toPublic(),
            temporaryPassword,
        };
    }
    async update(id, body, ctx) {
        if (body.firstName === undefined &&
            body.lastName === undefined &&
            body.role === undefined) {
            throw new common_1.BadRequestException('No fields to update');
        }
        await this.users.requireInOrg(id, ctx.organizationId);
        const updated = await this.users.updateProfile(id, {
            firstName: body.firstName?.trim(),
            lastName: body.lastName?.trim(),
            role: body.role,
        }, ctx.userId);
        return updated.toPublic();
    }
    async deactivate(id, ctx) {
        await this.users.requireInOrg(id, ctx.organizationId);
        const u = await this.users.deactivate(id, ctx.userId);
        return u.toPublic();
    }
    async reactivate(id, ctx) {
        await this.users.requireInOrg(id, ctx.organizationId);
        const u = await this.users.reactivate(id, ctx.userId);
        return u.toPublic();
    }
    async resetPassword(id, ctx) {
        await this.users.requireInOrg(id, ctx.organizationId);
        const { user, temporaryPassword } = await this.users.resetPassword(id, ctx.userId);
        return {
            user: user.toPublic(),
            temporaryPassword,
        };
    }
};
exports.UsersManagementController = UsersManagementController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersManagementController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(role_1.Role.OWNER),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [users_dto_1.InviteUserDto, Object]),
    __metadata("design:returntype", Promise)
], UsersManagementController.prototype, "invite", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(role_1.Role.OWNER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, users_dto_1.UpdateUserDto, Object]),
    __metadata("design:returntype", Promise)
], UsersManagementController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/deactivate'),
    (0, roles_decorator_1.Roles)(role_1.Role.OWNER),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersManagementController.prototype, "deactivate", null);
__decorate([
    (0, common_1.Post)(':id/reactivate'),
    (0, roles_decorator_1.Roles)(role_1.Role.OWNER),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersManagementController.prototype, "reactivate", null);
__decorate([
    (0, common_1.Post)(':id/reset-password'),
    (0, roles_decorator_1.Roles)(role_1.Role.OWNER),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersManagementController.prototype, "resetPassword", null);
exports.UsersManagementController = UsersManagementController = __decorate([
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersManagementController);
//# sourceMappingURL=users-management.controller.js.map