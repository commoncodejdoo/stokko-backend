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
exports.NestJwtTokenService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const jwt_token_service_1 = require("../../domain/auth/jwt-token.service");
const auth_errors_1 = require("../../domain/auth/auth.errors");
let NestJwtTokenService = class NestJwtTokenService extends jwt_token_service_1.JwtTokenService {
    jwt;
    secret;
    accessTtl;
    passwordChangeTtl = '1h';
    constructor(jwt, config) {
        super();
        this.jwt = jwt;
        this.secret = config.getOrThrow('JWT_SECRET');
        this.accessTtl = (config.get('JWT_ACCESS_TTL') ?? '15m');
    }
    async issueAccessToken(claims) {
        return this.jwt.signAsync({
            sub: claims.userId,
            userId: claims.userId,
            organizationId: claims.organizationId,
            role: claims.role,
            type: 'access',
        }, { secret: this.secret, expiresIn: this.accessTtl });
    }
    async verifyAccessToken(token) {
        const payload = await this.jwt.verifyAsync(token, {
            secret: this.secret,
        });
        if (payload.type !== 'access') {
            throw new Error('Wrong token type');
        }
        return payload;
    }
    async issuePasswordChangeToken(claims) {
        return this.jwt.signAsync({
            sub: claims.userId,
            userId: claims.userId,
            organizationId: claims.organizationId,
            type: 'pwd-change',
        }, { secret: this.secret, expiresIn: this.passwordChangeTtl });
    }
    async verifyPasswordChangeToken(token) {
        try {
            const payload = await this.jwt.verifyAsync(token, {
                secret: this.secret,
            });
            if (payload.type !== 'pwd-change') {
                throw new auth_errors_1.PasswordChangeTokenInvalidError();
            }
            return payload;
        }
        catch (err) {
            if (err instanceof auth_errors_1.PasswordChangeTokenInvalidError)
                throw err;
            throw new auth_errors_1.PasswordChangeTokenInvalidError();
        }
    }
};
exports.NestJwtTokenService = NestJwtTokenService;
exports.NestJwtTokenService = NestJwtTokenService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService])
], NestJwtTokenService);
//# sourceMappingURL=jwt-token.service.js.map