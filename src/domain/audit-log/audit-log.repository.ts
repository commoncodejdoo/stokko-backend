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

  /**
   * Article history — every audit entry that references this article:
   *  - Direct entries (entityType='Article', entityId=articleId)
   *  - Stock corrections for this article (entityType='StockCorrection',
   *    after.articleId = articleId)
   *
   * Procurement entries are intentionally excluded for MVP — their items
   * array would require a more involved JSONB query.
   */
  abstract findArticleHistory(
    organizationId: string,
    articleId: string,
    page: number,
    pageSize: number,
    tx?: TxClient,
  ): Promise<{ items: AuditLogEntry[]; total: number }>;

  abstract listPaginated(
    opts: { organizationId?: string; page: number; pageSize: number },
    tx?: TxClient,
  ): Promise<{ items: AuditLogEntry[]; total: number }>;
}
