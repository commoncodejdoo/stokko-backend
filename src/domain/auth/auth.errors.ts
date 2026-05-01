import { DomainError } from '../common/errors';

export class InvalidCredentialsError extends DomainError {
  readonly statusCode = 401;
  readonly code = 'INVALID_CREDENTIALS';

  constructor() {
    super('Invalid email or password');
  }
}

export class AccountInactiveError extends DomainError {
  readonly statusCode = 403;
  readonly code = 'ACCOUNT_INACTIVE';

  constructor() {
    super('Account is inactive');
  }
}

export class RefreshTokenInvalidError extends DomainError {
  readonly statusCode = 401;
  readonly code = 'REFRESH_TOKEN_INVALID';

  constructor(reason: string) {
    super(`Refresh token invalid: ${reason}`, { reason });
  }
}

export class PasswordChangeTokenInvalidError extends DomainError {
  readonly statusCode = 401;
  readonly code = 'PASSWORD_CHANGE_TOKEN_INVALID';

  constructor() {
    super('Password change token is invalid or expired');
  }
}

export class WeakPasswordError extends DomainError {
  readonly statusCode = 422;
  readonly code = 'WEAK_PASSWORD';

  constructor(reason: string) {
    super(`Password is too weak: ${reason}`, { reason });
  }
}
