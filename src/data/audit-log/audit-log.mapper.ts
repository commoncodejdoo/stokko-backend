import { AuditLog as PrismaAuditLog } from '@prisma/client';
import { AuditAction } from '../../domain/common/audit-action';
import { AuditLogEntry } from '../../domain/audit-log/audit-log.domain';

export class AuditLogMapper {
  toDomain(p: PrismaAuditLog): AuditLogEntry {
    return new AuditLogEntry(
      p.id,
      p.organizationId,
      p.userId,
      p.action as AuditAction,
      p.entityType,
      p.entityId,
      p.before,
      p.after,
      p.createdAt,
    );
  }
}
