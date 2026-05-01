"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const audit_log_service_1 = require("../audit-log/audit-log.service");
const audit_action_1 = require("../common/audit-action");
const password_hasher_1 = require("../common/password-hasher");
const users_service_1 = require("../users/users.service");
const auth_errors_1 = require("./auth.errors");
const jwt_token_service_1 = require("./jwt-token.service");
const refresh_token_codec_1 = require("./refresh-token-codec");
const refresh_tokens_repository_1 = require("./refresh-tokens.repository");
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;
let AuthService = class AuthService {
    users;
    hasher;
    refreshTokens;
    refreshCodec;
    jwt;
    auditLog;
    constructor(users, hasher, refreshTokens, refreshCodec, jwt, auditLog) {
        this.users = users;
        this.hasher = hasher;
        this.refreshTokens = refreshTokens;
        this.refreshCodec = refreshCodec;
        this.jwt = jwt;
        this.auditLog = auditLog;
    }
    async login(email, password) {
        const candidates = await this.users.findAllByEmail(email);
        let matched = null;
        for (const u of candidates) {
            if (!u.isActive)
                continue;
            const ok = await this.hasher.verify(password, u.passwordHash);
            if (ok) {
                matched = u;
                break;
            }
        }
        if (!matched)
            throw new auth_errors_1.InvalidCredentialsError();
        if (matched.mustChangePassword) {
            const passwordChangeToken = await this.jwt.issuePasswordChangeToken({
                userId: matched.id,
                organizationId: matched.organizationId,
            });
            return { requirePasswordChange: true, passwordChangeToken, user: matched };
        }
        const session = await this.issueSession(matched);
        await this.auditLog.record({
            organizationId: matched.organizationId,
            userId: matched.id,
            action: audit_action_1.AuditAction.USER_LOGGED_IN,
            entityType: 'User',
            entityId: matched.id,
        });
        return { requirePasswordChange: false, ...session, user: matched };
    }
    async refresh(plainRefreshToken) {
        const tokenHash = this.refreshCodec.hash(plainRefreshToken);
        const record = await this.refreshTokens.findByHash(tokenHash);
        if (!record)
            throw new auth_errors_1.RefreshTokenInvalidError('not found');
        if (!record.isUsable())
            throw new auth_errors_1.RefreshTokenInvalidError('expired or revoked');
        const user = await this.users.requireById(record.userId);
        if (!user.isActive)
            throw new auth_errors_1.AccountInactiveError();
        await this.refreshTokens.revoke(record.id);
        return this.issueSession(user);
    }
    async forcedPasswordChange(passwordChangeToken, newPassword) {
        const payload = await this.jwt.verifyPasswordChangeToken(passwordChangeToken);
        this.validatePasswordStrength(newPassword);
        const newHash = await this.hasher.hash(newPassword);
        const user = await this.users.setPassword(payload.userId, newHash, payload.userId);
        const session = await this.issueSession(user);
        return { ...session, user };
    }
    async changePassword(userId, currentPassword, newPassword, tx) {
        const user = await this.users.requireById(userId, tx);
        const ok = await this.hasher.verify(currentPassword, user.passwordHash);
        if (!ok)
            throw new auth_errors_1.InvalidCredentialsError();
        this.validatePasswordStrength(newPassword);
        const newHash = await this.hasher.hash(newPassword);
        await this.users.setPassword(userId, newHash, userId, tx);
    }
    async issueSession(user, tx) {
        const accessToken = await this.jwt.issueAccessToken({
            userId: user.id,
            organizationId: user.organizationId,
            role: user.role,
        });
        const plainRefresh = this.refreshCodec.generatePlaintext();
        const expiresAt = new Date(Date.now() + REFRESH_TTL_MS);
        await this.refreshTokens.create({
            organizationId: user.organizationId,
            userId: user.id,
            tokenHash: this.refreshCodec.hash(plainRefresh),
            expiresAt,
        }, tx);
        return { accessToken, refreshToken: plainRefresh };
    }
    validatePasswordStrength(password) {
        if (!password || password.length < 8) {
            throw new auth_errors_1.WeakPasswordError('Min 8 characters required');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        password_hasher_1.PasswordHasher,
        refresh_tokens_repository_1.RefreshTokensRepository,
        refresh_token_codec_1.RefreshTokenCodec,
        jwt_token_service_1.JwtTokenService,
        audit_log_service_1.AuditLogService])
], AuthService);
//# sourceMappingURL=auth.service.js.map