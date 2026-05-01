import { AuditAction } from '../common/audit-action';

/**
 * Input shape for recording an audit entry.
 *
 * `before` and `after` are JSON snapshots of the entity. They should be
 * the result of `domainModel.toSnapshot()` to keep them stable and free
 * of sensitive fields (e.g. `passwordHash` is never included).
 */
export interface AuditLogInput {
  organizationId: string;
  userId: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
}

/**
 * Stored audit entry.
 */
export class AuditLogEntry {
  constructor(
    readonly id: string,
    readonly organizationId: string,
    readonly userId: string,
    readonly action: AuditAction,
    readonly entityType: string,
    readonly entityId: string,
    readonly before: unknown,
    readonly after: unknown,
    readonly createdAt: Date,
  ) {}
}
