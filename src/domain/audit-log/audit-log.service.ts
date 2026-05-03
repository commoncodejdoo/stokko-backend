import { Injectable } from '@nestjs/common';
import { TxClient } from '../common/transaction';
import { AuditLogEntry, AuditLogInput } from './audit-log.domain';
import { AuditLogRepository } from './audit-log.repository';

/**
 * AuditLogService — every write-side service injects this and calls
 * `record(...)` after a successful state change.
 *
 * The call MUST happen inside the same Prisma transaction as the change
 * itself (pass the `tx` argument). That guarantees that a partial commit
 * never leaves the audit log out of sync.
 */
@Injectable()
export class AuditLogService {
  constructor(private readonly repo: AuditLogRepository) {}

  async record(input: AuditLogInput, tx?: TxClient): Promise<void> {
    await this.repo.create(input, tx);
  }

  async listRecent(organizationId: string, limit = 10): Promise<AuditLogEntry[]> {
    return this.repo.findRecentByOrg(organizationId, limit);
  }

  async listByEntity(
    organizationId: string,
    entityType: string,
    entityId: string,
    page = 1,
    pageSize = 50,
  ): Promise<{ items: AuditLogEntry[]; total: number }> {
    return this.repo.findByEntity(organizationId, entityType, entityId, page, pageSize);
  }

  async listArticleHistory(
    organizationId: string,
    articleId: string,
    page = 1,
    pageSize = 50,
  ): Promise<{ items: AuditLogEntry[]; total: number }> {
    return this.repo.findArticleHistory(organizationId, articleId, page, pageSize);
  }
}
