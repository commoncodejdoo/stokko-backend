import { Role } from './role';

/**
 * Context of the currently authenticated user, attached to every request
 * by the JWT auth guard.
 *
 * Carried through service calls so org scoping and audit logging can use
 * `userId` and `orgId` without each service re-fetching the user.
 */
export interface AuthContext {
  userId: string;
  organizationId: string;
  role: Role;
}
