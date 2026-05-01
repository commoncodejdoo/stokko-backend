import { AuditLogService } from '../audit-log/audit-log.service';
import { PasswordHasher } from '../common/password-hasher';
import { TxClient } from '../common/transaction';
import { User } from '../users/user.domain';
import { UsersService } from '../users/users.service';
import { JwtTokenService } from './jwt-token.service';
import { RefreshTokenCodec } from './refresh-token-codec';
import { RefreshTokensRepository } from './refresh-tokens.repository';
export interface SessionTokens {
    accessToken: string;
    refreshToken: string;
}
export type LoginResult = {
    requirePasswordChange: false;
    accessToken: string;
    refreshToken: string;
    user: User;
} | {
    requirePasswordChange: true;
    passwordChangeToken: string;
    user: User;
};
export declare class AuthService {
    private readonly users;
    private readonly hasher;
    private readonly refreshTokens;
    private readonly refreshCodec;
    private readonly jwt;
    private readonly auditLog;
    constructor(users: UsersService, hasher: PasswordHasher, refreshTokens: RefreshTokensRepository, refreshCodec: RefreshTokenCodec, jwt: JwtTokenService, auditLog: AuditLogService);
    login(email: string, password: string): Promise<LoginResult>;
    refresh(plainRefreshToken: string): Promise<SessionTokens>;
    forcedPasswordChange(passwordChangeToken: string, newPassword: string): Promise<SessionTokens & {
        user: User;
    }>;
    changePassword(userId: string, currentPassword: string, newPassword: string, tx?: TxClient): Promise<void>;
    private issueSession;
    private validatePasswordStrength;
}
