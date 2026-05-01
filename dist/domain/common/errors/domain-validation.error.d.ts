import { DomainError } from './base-domain.error';
export declare class DomainValidationError extends DomainError {
    readonly statusCode = 422;
    readonly code = "DOMAIN_INVARIANT_VIOLATED";
}
