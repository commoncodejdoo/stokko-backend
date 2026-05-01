import { TxClient } from '../common/transaction';
import { RefreshTokenRecord } from './refresh-token.domain';

export interface CreateRefreshTokenInput {
  organizationId: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

export abstract class RefreshTokensRepository {
  abstract create(input: CreateRefreshTokenInput, tx?: TxClient): Promise<RefreshTokenRecord>;
  abstract findByHash(tokenHash: string, tx?: TxClient): Promise<RefreshTokenRecord | null>;
  abstract revoke(id: string, tx?: TxClient): Promise<void>;
  /** Best-effort cleanup — removes expired and revoked tokens older than `cutoff`. */
  abstract pruneExpired(cutoff: Date, tx?: TxClient): Promise<number>;
}
