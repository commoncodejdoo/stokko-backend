/**
 * User role within an organization.
 *
 * Mirrors the Prisma `Role` enum but kept in the domain layer to enforce
 * the no-Prisma-import rule. Mappers convert between the two.
 */
export enum Role {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
}

export const ALL_ROLES: Role[] = [Role.OWNER, Role.ADMIN, Role.EMPLOYEE];
