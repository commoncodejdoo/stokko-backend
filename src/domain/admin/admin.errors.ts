import { DomainError } from '../common/errors';

export class AdminInvalidCredentialsError extends DomainError {
  readonly statusCode = 401;
  readonly code = 'ADMIN_INVALID_CREDENTIALS';
  constructor() {
    super('Invalid admin credentials');
  }
}

export class AdminUserNotFoundError extends DomainError {
  readonly statusCode = 404;
  readonly code = 'ADMIN_USER_NOT_FOUND';
  constructor(email: string) {
    super(`Admin user not found: ${email}`);
  }
}
