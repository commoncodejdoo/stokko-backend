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
exports.SuppliersService = void 0;
const common_1 = require("@nestjs/common");
const audit_log_service_1 = require("../audit-log/audit-log.service");
const audit_action_1 = require("../common/audit-action");
const errors_1 = require("../common/errors");
const suppliers_repository_1 = require("./suppliers.repository");
let SuppliersService = class SuppliersService {
    repo;
    auditLog;
    constructor(repo, auditLog) {
        this.repo = repo;
        this.auditLog = auditLog;
    }
    async findById(id, tx) {
        return this.repo.findById(id, tx);
    }
    async requireById(id, organizationId, tx) {
        const s = await this.repo.findById(id, tx);
        if (!s || s.isDeleted())
            throw new errors_1.EntityNotFoundError('Supplier', id);
        if (s.organizationId !== organizationId) {
            throw new errors_1.CrossOrgAccessError('Supplier', id);
        }
        return s;
    }
    async list(organizationId, tx) {
        return this.repo.listByOrg(organizationId, tx);
    }
    async create(cmd, ctx, tx) {
        const created = await this.repo.create({ organizationId: ctx.organizationId, ...cmd }, tx);
        await this.auditLog.record({
            organizationId: ctx.organizationId,
            userId: ctx.userId,
            action: audit_action_1.AuditAction.SUPPLIER_CREATED,
            entityType: 'Supplier',
            entityId: created.id,
            before: null,
            after: created.toSnapshot(),
        }, tx);
        return created;
    }
    async update(id, patch, ctx, tx) {
        const before = await this.requireById(id, ctx.organizationId, tx);
        const updated = await this.repo.update(id, patch, tx);
        await this.auditLog.record({
            organizationId: ctx.organizationId,
            userId: ctx.userId,
            action: audit_action_1.AuditAction.SUPPLIER_UPDATED,
            entityType: 'Supplier',
            entityId: updated.id,
            before: before.toSnapshot(),
            after: updated.toSnapshot(),
        }, tx);
        return updated;
    }
    async softDelete(id, ctx, tx) {
        const before = await this.requireById(id, ctx.organizationId, tx);
        const deleted = await this.repo.softDelete(id, tx);
        await this.auditLog.record({
            organizationId: ctx.organizationId,
            userId: ctx.userId,
            action: audit_action_1.AuditAction.SUPPLIER_DELETED,
            entityType: 'Supplier',
            entityId: deleted.id,
            before: before.toSnapshot(),
            after: deleted.toSnapshot(),
        }, tx);
    }
};
exports.SuppliersService = SuppliersService;
exports.SuppliersService = SuppliersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [suppliers_repository_1.SuppliersRepository,
        audit_log_service_1.AuditLogService])
], SuppliersService);
//# sourceMappingURL=suppliers.service.js.map