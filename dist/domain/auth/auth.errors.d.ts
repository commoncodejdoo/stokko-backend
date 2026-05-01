import { DomainError } from '../common/errors';
export declare class InvalidCredentialsError extends DomainError {
    readonly statusCode = 401;
    readonly code = "INVALID_CREDENTIALS";
    constructor();
}
export declare class AccountInactiveError extends DomainError {
    readonly statusCode = 403;
    readonly code = "ACCOUNT_INACTIVE";
    constructor();
}
export declare class RefreshTokenInvalidError extends DomainError {
    readonly statusCode = 401;
    readonly code = "REFRESH_TOKEN_INVALID";
    constructor(reason: string);
}
export declare class PasswordChangeTokenInvalidError extends DomainError {
    readonly statusCode = 401;
    readonly code = "PASSWORD_CHANGE_TOKEN_INVALID";
    constructor();
}
export declare class WeakPasswordError extends DomainError {
    readonly statusCode = 422;
    readonly code = "WEAK_PASSWORD";
    constructor(reason: string);
}
