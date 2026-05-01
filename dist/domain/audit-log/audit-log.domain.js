"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogEntry = void 0;
class AuditLogEntry {
    id;
    organizationId;
    userId;
    action;
    entityType;
    entityId;
    before;
    after;
    createdAt;
    constructor(id, organizationId, userId, action, entityType, entityId, before, after, createdAt) {
        this.id = id;
        this.organizationId = organizationId;
        this.userId = userId;
        this.action = action;
        this.entityType = entityType;
        this.entityId = entityId;
        this.before = before;
        this.after = after;
        this.createdAt = createdAt;
    }
}
exports.AuditLogEntry = AuditLogEntry;
//# sourceMappingURL=audit-log.domain.js.map