import { AuditLog as PrismaAuditLog } from '@prisma/client';
import { AuditLogEntry } from '../../domain/audit-log/audit-log.domain';
export declare class AuditLogMapper {
    toDomain(p: PrismaAuditLog): AuditLogEntry;
}
