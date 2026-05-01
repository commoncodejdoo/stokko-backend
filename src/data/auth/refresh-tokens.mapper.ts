import { RefreshToken as PrismaRefreshToken } from '@prisma/client';
import { RefreshTokenRecord } from '../../domain/auth/refresh-token.domain';

export class RefreshTokensMapper {
  toDomain(p: PrismaRefreshToken): RefreshTokenRecord {
    return new RefreshTokenRecord(
      p.id,
      p.organizationId,
      p.userId,
      p.tokenHash,
      p.expiresAt,
      p.revokedAt,
      p.createdAt,
    );
  }
}
