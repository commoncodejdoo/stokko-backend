import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { RefreshTokenRecord } from '../../domain/auth/refresh-token.domain';
import {
  CreateRefreshTokenInput,
  RefreshTokensRepository,
} from '../../domain/auth/refresh-tokens.repository';
import { TxClient } from '../../domain/common/transaction';
import { PrismaService } from '../common/prisma/prisma.service';
import { RefreshTokensMapper } from './refresh-tokens.mapper';

@Injectable()
export class PrismaRefreshTokensRepository extends RefreshTokensRepository {
  private readonly mapper = new RefreshTokensMapper();

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  private client(tx?: TxClient): Prisma.TransactionClient | PrismaService {
    return tx ?? this.prisma;
  }

  async create(input: CreateRefreshTokenInput, tx?: TxClient): Promise<RefreshTokenRecord> {
    const row = await this.client(tx).refreshToken.create({ data: input });
    return this.mapper.toDomain(row);
  }

  async findByHash(tokenHash: string, tx?: TxClient): Promise<RefreshTokenRecord | null> {
    const row = await this.client(tx).refreshToken.findUnique({ where: { tokenHash } });
    return row ? this.mapper.toDomain(row) : null;
  }

  async revoke(id: string, tx?: TxClient): Promise<void> {
    await this.client(tx).refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  async pruneExpired(cutoff: Date, tx?: TxClient): Promise<number> {
    const res = await this.client(tx).refreshToken.deleteMany({
      where: {
        OR: [{ expiresAt: { lt: cutoff } }, { revokedAt: { not: null } }],
      },
    });
    return res.count;
  }
}
