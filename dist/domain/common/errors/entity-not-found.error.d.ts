import { DomainError } from './base-domain.error';
export declare class EntityNotFoundError extends DomainError {
    readonly statusCode = 404;
    readonly code: string;
    constructor(entityType: string, identifier: string | Record<string, unknown>);
}
