"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const jwt_token_service_1 = require("../../data/auth/jwt-token.service");
const refresh_token_codec_1 = require("../../data/auth/refresh-token-codec");
const refresh_tokens_repository_1 = require("../../data/auth/refresh-tokens.repository");
const auth_service_1 = require("../../domain/auth/auth.service");
const jwt_token_service_2 = require("../../domain/auth/jwt-token.service");
const refresh_token_codec_2 = require("../../domain/auth/refresh-token-codec");
const refresh_tokens_repository_2 = require("../../domain/auth/refresh-tokens.repository");
const audit_log_module_1 = require("../audit-log/audit-log.module");
const jwt_strategy_1 = require("../common/auth/jwt.strategy");
const users_module_1 = require("../users/users.module");
const auth_controller_1 = require("./auth.controller");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule,
            jwt_1.JwtModule.registerAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    secret: config.getOrThrow('JWT_SECRET'),
                    signOptions: {
                        expiresIn: (config.get('JWT_ACCESS_TTL') ?? '15m'),
                    },
                }),
            }),
            users_module_1.UsersModule,
            audit_log_module_1.AuditLogModule,
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [
            jwt_strategy_1.JwtStrategy,
            { provide: refresh_tokens_repository_2.RefreshTokensRepository, useClass: refresh_tokens_repository_1.PrismaRefreshTokensRepository },
            { provide: refresh_token_codec_2.RefreshTokenCodec, useClass: refresh_token_codec_1.Sha256RefreshTokenCodec },
            { provide: jwt_token_service_2.JwtTokenService, useClass: jwt_token_service_1.NestJwtTokenService },
            auth_service_1.AuthService,
        ],
        exports: [auth_service_1.AuthService, jwt_token_service_2.JwtTokenService],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map