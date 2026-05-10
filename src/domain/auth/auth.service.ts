import { Injectable } from '@nestjs/common';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AuditAction } from '../common/audit-action';
import { PasswordHasher } from '../common/password-hasher';
import { TxClient } from '../common/transaction';
import { User } from '../users/user.domain';
import { UsersService } from '../users/users.service';
import {
  AccountInactiveError,
  InvalidCredentialsError,
  RefreshTokenInvalidError,
  WeakPasswordError,
} from './auth.errors';
import { JwtTokenService } from './jwt-token.service';
import { RefreshTokenCodec } from './refresh-token-codec';
import { RefreshTokensRepository } from './refresh-tokens.repository';

const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
}

export type LoginResult =
  | {
      requirePasswordChange: false;
      accessToken: string;
      refreshToken: string;
      user: User;
    }
  | {
      requirePasswordChange: true;
      passwordChangeToken: string;
      user: User;
    };

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly hasher: PasswordHasher,
    private readonly refreshTokens: RefreshTokensRepository,
    private readonly refreshCodec: RefreshTokenCodec,
    private readonly jwt: JwtTokenService,
    private readonly auditLog: AuditLogService,
  ) {}

  async login(email: string, password: string): Promise<LoginResult> {
    const candidates = await this.users.findAllByEmail(email);

    let matched: User | null = null;
    for (const u of candidates) {
      if (!u.isActive) continue;
      const ok = await this.hasher.verify(password, u.passwordHash);
      if (ok) {
        matched = u;
        break;
      }
    }
    if (!matched) throw new InvalidCredentialsError();

    if (matched.mustChangePassword) {
      const passwordChangeToken = await this.jwt.issuePasswordChangeToken({
        userId: matched.id,
        organizationId: matched.organizationId,
      });
      return { requirePasswordChange: true, passwordChangeToken, user: matched };
    }

    const session = await this.issueSession(matched);
    await this.users.recordLogin(matched.id);
    await this.auditLog.record({
      organizationId: matched.organizationId,
      userId: matched.id,
      action: AuditAction.USER_LOGGED_IN,
      entityType: 'User',
      entityId: matched.id,
    });
    return { requirePasswordChange: false, ...session, user: matched };
  }

  async refresh(plainRefreshToken: string): Promise<SessionTokens> {
    const tokenHash = this.refreshCodec.hash(plainRefreshToken);
    const record = await this.refreshTokens.findByHash(tokenHash);

    if (!record) throw new RefreshTokenInvalidError('not found');
    if (!record.isUsable()) throw new RefreshTokenInvalidError('expired or revoked');

    const user = await this.users.requireById(record.userId);
    if (!user.isActive) throw new AccountInactiveError();

    // Token rotation — revoke old, issue new.
    await this.refreshTokens.revoke(record.id);
    return this.issueSession(user);
  }

  /**
   * Forced password change after a login that returned `requirePasswordChange`.
   * Verifies the short-lived password-change token, persists the new password,
   * clears the `mustChangePassword` flag, and issues a fresh session.
   */
  async forcedPasswordChange(
    passwordChangeToken: string,
    newPassword: string,
  ): Promise<SessionTokens & { user: User }> {
    const payload = await this.jwt.verifyPasswordChangeToken(passwordChangeToken);
    this.validatePasswordStrength(newPassword);

    const newHash = await this.hasher.hash(newPassword);
    const user = await this.users.setPassword(payload.userId, newHash, payload.userId);
    const session = await this.issueSession(user);
    return { ...session, user };
  }

  /**
   * Voluntary password change while the user is already authenticated.
   * Verifies the current password and persists the new one.
   * Does NOT rotate tokens — the existing session continues.
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    tx?: TxClient,
  ): Promise<void> {
    const user = await this.users.requireById(userId, tx);
    const ok = await this.hasher.verify(currentPassword, user.passwordHash);
    if (!ok) throw new InvalidCredentialsError();
    this.validatePasswordStrength(newPassword);
    const newHash = await this.hasher.hash(newPassword);
    await this.users.setPassword(userId, newHash, userId, tx);
  }

  private async issueSession(user: User, tx?: TxClient): Promise<SessionTokens> {
    const accessToken = await this.jwt.issueAccessToken({
      userId: user.id,
      organizationId: user.organizationId,
      role: user.role,
    });

    const plainRefresh = this.refreshCodec.generatePlaintext();
    const expiresAt = new Date(Date.now() + REFRESH_TTL_MS);
    await this.refreshTokens.create(
      {
        organizationId: user.organizationId,
        userId: user.id,
        tokenHash: this.refreshCodec.hash(plainRefresh),
        expiresAt,
      },
      tx,
    );

    return { accessToken, refreshToken: plainRefresh };
  }

  private validatePasswordStrength(password: string): void {
    if (!password || password.length < 8) {
      throw new WeakPasswordError('Min 8 characters required');
    }
  }
}
