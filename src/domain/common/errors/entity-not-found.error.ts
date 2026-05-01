import { DomainError } from './base-domain.error';

/**
 * Thrown when an entity does not exist or has been soft-deleted.
 *
 * `entityType` is also used as the prefix of the `code` field:
 *   new EntityNotFoundError('Article', id) → code: 'ARTICLE_NOT_FOUND'
 */
export class EntityNotFoundError extends DomainError {
  readonly statusCode = 404;
  readonly code: string;

  constructor(entityType: string, identifier: string | Record<string, unknown>) {
    const idStr = typeof identifier === 'string' ? identifier : JSON.stringify(identifier);
    super(`${entityType} not found (${idStr})`, {
      entityType,
      identifier,
    });
    this.code = `${entityType.toUpperCase().replace(/\s+/g, '_')}_NOT_FOUND`;
  }
}
