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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const audit_action_1 = require("../common/audit-action");
const errors_1 = require("../common/errors");
const password_hasher_1 = require("../common/password-hasher");
const audit_log_service_1 = require("../audit-log/audit-log.service");
const users_repository_1 = require("./users.repository");
let UsersService = class UsersService {
    repo;
    hasher;
    auditLog;
    constructor(repo, hasher, auditLog) {
        this.repo = repo;
        this.hasher = hasher;
        this.auditLog = auditLog;
    }
    async findById(id, tx) {
        return this.repo.findById(id, tx);
    }
    async requireById(id, tx) {
        const user = await this.repo.findById(id, tx);
        if (!user)
            throw new errors_1.EntityNotFoundError('User', id);
        return user;
    }
    async findByEmailInOrg(email, organizationId, tx) {
        return this.repo.findByEmailInOrg(email, organizationId, tx);
    }
    async findAllByEmail(email, tx) {
        return this.repo.findAllByEmail(email, tx);
    }
    async listByOrg(organizationId, tx) {
        return this.repo.listByOrg(organizationId, tx);
    }
    async invite(input, actorUserId, tx) {
        const temporaryPassword = this.hasher.generateTemporary();
        const passwordHash = await this.hasher.hash(temporaryPassword);
        const user = await this.repo.create({
            ...input,
            passwordHash,
            mustChangePassword: true,
        }, tx);
        await this.auditLog.record({
            organizationId: user.organizationId,
            userId: actorUserId ?? user.id,
            action: audit_action_1.AuditAction.USER_INVITED,
            entityType: 'User',
            entityId: user.id,
            before: null,
            after: user.toSnapshot(),
        }, tx);
        return { user, temporaryPassword };
    }
    async setPassword(userId, newPasswordHash, actorUserId, tx) {
        const before = await this.requireById(userId, tx);
        const after = await this.repo.update(userId, { passwordHash: newPasswordHash, mustChangePassword: false }, tx);
        await this.auditLog.record({
            organizationId: before.organizationId,
            userId: actorUserId,
            action: audit_action_1.AuditAction.USER_PASSWORD_CHANGED,
            entityType: 'User',
            entityId: userId,
            before: before.toSnapshot(),
            after: after.toSnapshot(),
        }, tx);
        return after;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_repository_1.UsersRepository,
        password_hasher_1.PasswordHasher,
        audit_log_service_1.AuditLogService])
], UsersService);
//# sourceMappingURL=users.service.js.map