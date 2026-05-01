"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeakPasswordError = exports.PasswordChangeTokenInvalidError = exports.RefreshTokenInvalidError = exports.AccountInactiveError = exports.InvalidCredentialsError = void 0;
const errors_1 = require("../common/errors");
class InvalidCredentialsError extends errors_1.DomainError {
    statusCode = 401;
    code = 'INVALID_CREDENTIALS';
    constructor() {
        super('Invalid email or password');
    }
}
exports.InvalidCredentialsError = InvalidCredentialsError;
class AccountInactiveError extends errors_1.DomainError {
    statusCode = 403;
    code = 'ACCOUNT_INACTIVE';
    constructor() {
        super('Account is inactive');
    }
}
exports.AccountInactiveError = AccountInactiveError;
class RefreshTokenInvalidError extends errors_1.DomainError {
    statusCode = 401;
    code = 'REFRESH_TOKEN_INVALID';
    constructor(reason) {
        super(`Refresh token invalid: ${reason}`, { reason });
    }
}
exports.RefreshTokenInvalidError = RefreshTokenInvalidError;
class PasswordChangeTokenInvalidError extends errors_1.DomainError {
    statusCode = 401;
    code = 'PASSWORD_CHANGE_TOKEN_INVALID';
    constructor() {
        super('Password change token is invalid or expired');
    }
}
exports.PasswordChangeTokenInvalidError = PasswordChangeTokenInvalidError;
class WeakPasswordError extends errors_1.DomainError {
    statusCode = 422;
    code = 'WEAK_PASSWORD';
    constructor(reason) {
        super(`Password is too weak: ${reason}`, { reason });
    }
}
exports.WeakPasswordError = WeakPasswordError;
//# sourceMappingURL=auth.errors.js.map