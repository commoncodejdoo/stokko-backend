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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const audit_log_service_1 = require("../audit-log/audit-log.service");
const audit_action_1 = require("../common/audit-action");
const errors_1 = require("../common/errors");
const predefined_categories_1 = require("../common/predefined-categories");
const categories_repository_1 = require("./categories.repository");
let CategoriesService = class CategoriesService {
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
        const cat = await this.repo.findById(id, tx);
        if (!cat || cat.isDeleted())
            throw new errors_1.EntityNotFoundError('Category', id);
        if (cat.organizationId !== organizationId) {
            throw new errors_1.CrossOrgAccessError('Category', id);
        }
        return cat;
    }
    async create(name, ctx, tx) {
        const created = await this.repo.create({ organizationId: ctx.organizationId, name, isPredefined: false }, tx);
        await this.auditLog.record({
            organizationId: ctx.organizationId,
            userId: ctx.userId,
            action: audit_action_1.AuditAction.CATEGORY_CREATED,
            entityType: 'Category',
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
            action: audit_action_1.AuditAction.CATEGORY_UPDATED,
            entityType: 'Category',
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
            action: audit_action_1.AuditAction.CATEGORY_DELETED,
            entityType: 'Category',
            entityId: deleted.id,
            before: before.toSnapshot(),
            after: deleted.toSnapshot(),
        }, tx);
    }
    async seedPredefined(organizationId, actorUserId, tx) {
        const created = [];
        for (const name of predefined_categories_1.PREDEFINED_CATEGORIES) {
            const cat = await this.repo.create({ organizationId, name, isPredefined: true }, tx);
            created.push(cat);
            await this.auditLog.record({
                organizationId,
                userId: actorUserId,
                action: audit_action_1.AuditAction.CATEGORY_CREATED,
                entityType: 'Category',
                entityId: cat.id,
                before: null,
                after: cat.toSnapshot(),
            }, tx);
        }
        return created;
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [categories_repository_1.CategoriesRepository,
        audit_log_service_1.AuditLogService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map