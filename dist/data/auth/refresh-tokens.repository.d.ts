import { RefreshTokenRecord } from '../../domain/auth/refresh-token.domain';
import { CreateRefreshTokenInput, RefreshTokensRepository } from '../../domain/auth/refresh-tokens.repository';
import { TxClient } from '../../domain/common/transaction';
import { PrismaService } from '../common/prisma/prisma.service';
export declare class PrismaRefreshTokensRepository extends RefreshTokensRepository {
    private readonly prisma;
    private readonly mapper;
    constructor(prisma: PrismaService);
    private client;
    create(input: CreateRefreshTokenInput, tx?: TxClient): Promise<RefreshTokenRecord>;
    findByHash(tokenHash: string, tx?: TxClient): Promise<RefreshTokenRecord | null>;
    revoke(id: string, tx?: TxClient): Promise<void>;
    pruneExpired(cutoff: Date, tx?: TxClient): Promise<number>;
}
