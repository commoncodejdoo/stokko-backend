import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccessDeniedError } from '../../../domain/common/errors';
import { AuthContext } from '../../../domain/common/auth-context';
import { Role } from '../../../domain/common/role';
import { ROLES_KEY } from './roles.decorator';

/**
 * Reads the `@Roles(...)` metadata and enforces it against the current
 * `req.user`. Run AFTER `JwtAuthGuard` so `req.user` is populated.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const req = context.switchToHttp().getRequest<{ user?: AuthContext }>();
    const user = req.user;
    if (!user) throw new AccessDeniedError('Not authenticated');
    if (!required.includes(user.role)) {
      throw new AccessDeniedError(
        `Role "${user.role}" is not allowed (required: ${required.join(', ')})`,
        { actualRole: user.role, requiredRoles: required },
      );
    }
    return true;
  }
}
