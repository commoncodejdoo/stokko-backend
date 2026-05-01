import { TxClient } from '../common/transaction';
import { AuditLogEntry, AuditLogInput } from './audit-log.domain';

/**
 * Abstract class doubles as the DI token in NestJS modules and as the
 * TypeScript interface for the data layer to implement.
 */
export abstract class AuditLogRepository {
  abstract create(input: AuditLogInput, tx?: TxClient): Promise<void>;

  abstract findRecentByOrg(
    organizationId: string,
    limit: number,
    tx?: TxClient,
  ): Promise<AuditLogEntry[]>;

  abstract findByEntity(
    organizationId: string,
    entityType: string,
    entityId: string,
    page: number,
    pageSize: number,
    tx?: TxClient,
  ): Promise<{ items: AuditLogEntry[]; total: number }>;
}
