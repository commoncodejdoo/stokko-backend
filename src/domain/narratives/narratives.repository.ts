import { Decimal } from 'decimal.js';
import { TxClient } from '../common/transaction';
import {
  NarrativeKind,
  RecommendationNarrative,
} from './recommendation-narrative.domain';

export interface CreateNarrativeInput {
  organizationId: string;
  kind: NarrativeKind;
  body: string;
  articleId?: string | null;
  warehouseId?: string | null;
  modelUsed: string;
  tokensIn: number;
  tokensOut: number;
  cachedTokens: number;
  costUsd: Decimal;
  validForDate?: Date | null;
}

export abstract class NarrativesRepository {
  abstract create(input: CreateNarrativeInput, tx?: TxClient): Promise<RecommendationNarrative>;
  abstract findDigestByDate(
    organizationId: string,
    date: Date,
    tx?: TxClient,
  ): Promise<RecommendationNarrative | null>;
  abstract findRecentExplanation(
    organizationId: string,
    articleId: string,
    warehouseId: string,
    minCreatedAt: Date,
    tx?: TxClient,
  ): Promise<RecommendationNarrative | null>;
}
