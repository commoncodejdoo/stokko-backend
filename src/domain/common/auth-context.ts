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
  /**
   * Admin id that initiated the impersonation session. Mirrored into
   * AsyncLocalStorage by `RequestContextInterceptor` so write-side services
   * can suppress audit-log entries while the admin operates as Owner.
   */
  impersonatedBy?: string;
  /**
   * Mirror of `Organization.priceTrackingEnabled`. Populated by `JwtStrategy`
   * on every request so the `PriceTrackingFilterInterceptor` (and downstream
   * filters) can decide whether to strip cost/revenue fields without
   * re-querying the database.
   */
  priceTrackingEnabled?: boolean;
}
