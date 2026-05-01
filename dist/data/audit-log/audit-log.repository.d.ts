import { AuditLogEntry, AuditLogInput } from '../../domain/audit-log/audit-log.domain';
import { AuditLogRepository } from '../../domain/audit-log/audit-log.repository';
import { TxClient } from '../../domain/common/transaction';
import { PrismaService } from '../common/prisma/prisma.service';
export declare class PrismaAuditLogRepository extends AuditLogRepository {
    private readonly prisma;
    private readonly mapper;
    constructor(prisma: PrismaService);
    private client;
    create(input: AuditLogInput, tx?: TxClient): Promise<void>;
    findRecentByOrg(organizationId: string, limit: number, tx?: TxClient): Promise<AuditLogEntry[]>;
    findByEntity(organizationId: string, entityType: string, entityId: string, page: number, pageSize: number, tx?: TxClient): Promise<{
        items: AuditLogEntry[];
        total: number;
    }>;
}
