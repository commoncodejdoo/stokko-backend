import { RefreshToken as PrismaRefreshToken } from '@prisma/client';
import { RefreshTokenRecord } from '../../domain/auth/refresh-token.domain';
export declare class RefreshTokensMapper {
    toDomain(p: PrismaRefreshToken): RefreshTokenRecord;
}
