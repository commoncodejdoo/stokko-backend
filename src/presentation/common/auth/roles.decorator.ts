import { SetMetadata } from '@nestjs/common';
import { Role } from '../../../domain/common/role';

export const ROLES_KEY = 'roles';

/**
 * Restricts a controller method (or whole controller) to the listed roles.
 *
 * Must be combined with `@UseGuards(JwtAuthGuard, RolesGuard)`.
 *
 * @example
 *   @Roles(Role.OWNER)
 *   @UseGuards(JwtAuthGuard, RolesGuard)
 *   inviteUser() { ... }
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
