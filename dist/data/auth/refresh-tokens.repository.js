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
exports.PrismaRefreshTokensRepository = void 0;
const common_1 = require("@nestjs/common");
const refresh_tokens_repository_1 = require("../../domain/auth/refresh-tokens.repository");
const prisma_service_1 = require("../common/prisma/prisma.service");
const refresh_tokens_mapper_1 = require("./refresh-tokens.mapper");
let PrismaRefreshTokensRepository = class PrismaRefreshTokensRepository extends refresh_tokens_repository_1.RefreshTokensRepository {
    prisma;
    mapper = new refresh_tokens_mapper_1.RefreshTokensMapper();
    constructor(prisma) {
        super();
        this.prisma = prisma;
    }
    client(tx) {
        return tx ?? this.prisma;
    }
    async create(input, tx) {
        const row = await this.client(tx).refreshToken.create({ data: input });
        return this.mapper.toDomain(row);
    }
    async findByHash(tokenHash, tx) {
        const row = await this.client(tx).refreshToken.findUnique({ where: { tokenHash } });
        return row ? this.mapper.toDomain(row) : null;
    }
    async revoke(id, tx) {
        await this.client(tx).refreshToken.update({
            where: { id },
            data: { revokedAt: new Date() },
        });
    }
    async pruneExpired(cutoff, tx) {
        const res = await this.client(tx).refreshToken.deleteMany({
            where: {
                OR: [{ expiresAt: { lt: cutoff } }, { revokedAt: { not: null } }],
            },
        });
        return res.count;
    }
};
exports.PrismaRefreshTokensRepository = PrismaRefreshTokensRepository;
exports.PrismaRefreshTokensRepository = PrismaRefreshTokensRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaRefreshTokensRepository);
//# sourceMappingURL=refresh-tokens.repository.js.map