"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenRecord = void 0;
class RefreshTokenRecord {
    id;
    organizationId;
    userId;
    tokenHash;
    expiresAt;
    revokedAt;
    createdAt;
    constructor(id, organizationId, userId, tokenHash, expiresAt, revokedAt, createdAt) {
        this.id = id;
        this.organizationId = organizationId;
        this.userId = userId;
        this.tokenHash = tokenHash;
        this.expiresAt = expiresAt;
        this.revokedAt = revokedAt;
        this.createdAt = createdAt;
    }
    isExpired(now = new Date()) {
        return this.expiresAt.getTime() <= now.getTime();
    }
    isRevoked() {
        return this.revokedAt !== null;
    }
    isUsable(now = new Date()) {
        return !this.isRevoked() && !this.isExpired(now);
    }
}
exports.RefreshTokenRecord = RefreshTokenRecord;
//# sourceMappingURL=refresh-token.domain.js.map