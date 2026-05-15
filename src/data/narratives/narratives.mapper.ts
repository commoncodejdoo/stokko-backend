import {
  RecommendationNarrative as PrismaNarrative,
  NarrativeKind as PrismaNarrativeKind,
} from '@prisma/client';
import { Decimal } from 'decimal.js';
import {
  NarrativeKind,
  RecommendationNarrative,
} from '../../domain/narratives/recommendation-narrative.domain';

export class NarrativesMapper {
  toDomain(row: PrismaNarrative): RecommendationNarrative {
    return new RecommendationNarrative(
      row.id,
      row.organizationId,
      row.kind as NarrativeKind,
      row.body,
      row.articleId,
      row.warehouseId,
      row.modelUsed,
      row.tokensIn,
      row.tokensOut,
      row.cachedTokens,
      new Decimal(row.costUsd.toString()),
      row.validForDate,
      row.createdAt,
    );
  }

  toPrismaKind(k: NarrativeKind): PrismaNarrativeKind {
    return k as PrismaNarrativeKind;
  }
}
