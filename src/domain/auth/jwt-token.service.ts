import { Role } from '../common/role';

export interface AccessTokenClaims {
  userId: string;
  organizationId: string;
  role: Role;
  /** Admin id that opened the impersonation session. */
  impersonatedBy?: string;
}

export interface AccessTokenPayload extends AccessTokenClaims {
  type: 'access';
  iat: number;
  exp: number;
}

export interface ImpersonationTokenClaims {
  userId: string;
  organizationId: string;
  role: Role;
  adminId: string;
  /** TTL in seconds (default 1 hour). */
  ttlSeconds?: number;
}

export interface PasswordChangeTokenClaims {
  userId: string;
  organizationId: string;
}

export interface PasswordChangeTokenPayload extends PasswordChangeTokenClaims {
  type: 'pwd-change';
  iat: number;
  exp: number;
}

export interface AdminTokenClaims {
  adminId: string;
}

export interface AdminTokenPayload extends AdminTokenClaims {
  type: 'platform-admin';
  iat: number;
  exp: number;
}

/**
 * Abstraction over JWT signing/verification. Concrete implementation
 * lives in `data/auth/jwt-token.service.ts` and is backed by
 * `@nestjs/jwt`.
 *
 * Domain talks to this interface so a token format change doesn't
 * ripple through services.
 */
export abstract class JwtTokenService {
  abstract issueAccessToken(claims: AccessTokenClaims): Promise<string>;
  abstract verifyAccessToken(token: string): Promise<AccessTokenPayload>;

  abstract issuePasswordChangeToken(claims: PasswordChangeTokenClaims): Promise<string>;
  abstract verifyPasswordChangeToken(token: string): Promise<PasswordChangeTokenPayload>;

  abstract issueAdminToken(claims: AdminTokenClaims): Promise<string>;
  abstract verifyAdminToken(token: string): Promise<AdminTokenPayload>;

  /**
   * Issues a short-lived access token that carries `impersonatedBy: <adminId>`.
   * Verifies as a normal access token; the `RequestContextInterceptor`
   * mirrors `impersonatedBy` into AsyncLocalStorage so `AuditLogService`
   * can suppress audit entries for the duration of the session.
   */
  abstract issueImpersonationToken(claims: ImpersonationTokenClaims): Promise<{
    accessToken: string;
    expiresAt: Date;
  }>;
}
