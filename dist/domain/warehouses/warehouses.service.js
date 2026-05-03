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
exports.WarehousesService = void 0;
const common_1 = require("@nestjs/common");
const audit_log_service_1 = require("../audit-log/audit-log.service");
const audit_action_1 = require("../common/audit-action");
const errors_1 = require("../common/errors");
const warehouses_repository_1 = require("./warehouses.repository");
let WarehousesService = class WarehousesService {
    repo;
    auditLog;
    constructor(repo, auditLog) {
        this.repo = repo;
        this.auditLog = auditLog;
    }
    async list(organizationId, tx) {
        return this.repo.listByOrg(organizationId, tx);
    }
    async findById(id, tx) {
        return this.repo.findById(id, tx);
    }
    async requireById(id, organizationId, tx) {
        const wh = await this.repo.findById(id, tx);
        if (!wh || wh.isDeleted())
            throw new errors_1.EntityNotFoundError('Warehouse', id);
        if (wh.organizationId !== organizationId) {
            throw new errors_1.CrossOrgAccessError('Warehouse', id);
        }
        return wh;
    }
    async create(input, ctx, tx) {
        const created = await this.repo.create({ organizationId: ctx.organizationId, ...input }, tx);
        await this.auditLog.record({
            organizationId: ctx.organizationId,
            userId: ctx.userId,
            action: audit_action_1.AuditAction.WAREHOUSE_CREATED,
            entityType: 'Warehouse',
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
            action: audit_action_1.AuditAction.WAREHOUSE_UPDATED,
            entityType: 'Warehouse',
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
            action: audit_action_1.AuditAction.WAREHOUSE_DELETED,
            entityType: 'Warehouse',
            entityId: deleted.id,
            before: before.toSnapshot(),
            after: deleted.toSnapshot(),
        }, tx);
    }
};
exports.WarehousesService = WarehousesService;
exports.WarehousesService = WarehousesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [warehouses_repository_1.WarehousesRepository,
        audit_log_service_1.AuditLogService])
], WarehousesService);
//# sourceMappingURL=warehouses.service.js.map