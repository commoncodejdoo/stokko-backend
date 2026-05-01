"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogMapper = void 0;
const audit_log_domain_1 = require("../../domain/audit-log/audit-log.domain");
class AuditLogMapper {
    toDomain(p) {
        return new audit_log_domain_1.AuditLogEntry(p.id, p.organizationId, p.userId, p.action, p.entityType, p.entityId, p.before, p.after, p.createdAt);
    }
}
exports.AuditLogMapper = AuditLogMapper;
//# sourceMappingURL=audit-log.mapper.js.map