import { DomainError } from './base-domain.error';
export declare class AccessDeniedError extends DomainError {
    readonly statusCode = 403;
    readonly code = "ACCESS_DENIED";
}
export declare class CrossOrgAccessError extends DomainError {
    readonly statusCode = 403;
    readonly code = "CROSS_ORG_ACCESS_DENIED";
    constructor(entityType: string, entityId: string);
}
