import { DomainError } from './base-domain.error';

/**
 * Thrown from a domain constructor when an invariant is violated,
 * e.g. `thresholdCritical >= thresholdWarning` or `Money.amount < 0`.
 *
 * Distinct from `VALIDATION_ERROR` (DTO-level) — this is a deeper semantic
 * issue that DTO validation should normally prevent, but the domain is
 * the last line of defense.
 */
export class DomainValidationError extends DomainError {
  readonly statusCode = 422;
  readonly code = 'DOMAIN_INVARIANT_VIOLATED';
}
