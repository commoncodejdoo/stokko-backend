import { DomainError } from './base-domain.error';

/**
 * Generic access denied — user lacks the required role/permission.
 */
export class AccessDeniedError extends DomainError {
  readonly statusCode = 403;
  readonly code = 'ACCESS_DENIED';
}

/**
 * Attempt to access an entity that belongs to a different organization.
 * The most common security bug in a multi-tenant system — happens
 * routinely when a repository forgets to filter by `organizationId`.
 */
export class CrossOrgAccessError extends DomainError {
  readonly statusCode = 403;
  readonly code = 'CROSS_ORG_ACCESS_DENIED';

  constructor(entityType: string, entityId: string) {
    super('Access denied — entity belongs to a different organization', {
      entityType,
      entityId,
    });
  }
}
