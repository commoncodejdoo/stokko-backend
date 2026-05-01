"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokensMapper = void 0;
const refresh_token_domain_1 = require("../../domain/auth/refresh-token.domain");
class RefreshTokensMapper {
    toDomain(p) {
        return new refresh_token_domain_1.RefreshTokenRecord(p.id, p.organizationId, p.userId, p.tokenHash, p.expiresAt, p.revokedAt, p.createdAt);
    }
}
exports.RefreshTokensMapper = RefreshTokensMapper;
//# sourceMappingURL=refresh-tokens.mapper.js.map