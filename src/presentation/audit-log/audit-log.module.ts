import { Module } from '@nestjs/common';
import { PrismaAuditLogRepository } from '../../data/audit-log/audit-log.repository';
import { AuditLogRepository } from '../../domain/audit-log/audit-log.repository';
import { AuditLogService } from '../../domain/audit-log/audit-log.service';

/**
 * AuditLog module — internal feature, no controller in MVP.
 * Exposes `AuditLogService` for any other feature module that needs to
 * record audit entries.
 */
@Module({
  providers: [
    { provide: AuditLogRepository, useClass: PrismaAuditLogRepository },
    AuditLogService,
  ],
  exports: [AuditLogService],
})
export class AuditLogModule {}
