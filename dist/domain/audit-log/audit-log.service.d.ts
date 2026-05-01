import { TxClient } from '../common/transaction';
import { AuditLogEntry, AuditLogInput } from './audit-log.domain';
import { AuditLogRepository } from './audit-log.repository';
export declare class AuditLogService {
    private readonly repo;
    constructor(repo: AuditLogRepository);
    record(input: AuditLogInput, tx?: TxClient): Promise<void>;
    listRecent(organizationId: string, limit?: number): Promise<AuditLogEntry[]>;
    listByEntity(organizationId: string, entityType: string, entityId: string, page?: number, pageSize?: number): Promise<{
        items: AuditLogEntry[];
        total: number;
    }>;
}
