import { Decimal } from 'decimal.js';

export type NarrativeKind = 'DAILY_DIGEST' | 'ITEM_EXPLANATION' | 'ANOMALY';

/**
 * Persisted LLM output — daily digest (one per org per day) or per-article
 * explanation. The cost and token counts are kept for observability and
 * future budget alerts.
 */
export class RecommendationNarrative {
  constructor(
    readonly id: string,
    readonly organizationId: string,
    readonly kind: NarrativeKind,
    readonly body: string,
    readonly articleId: string | null,
    readonly warehouseId: string | null,
    readonly modelUsed: string,
    readonly tokensIn: number,
    readonly tokensOut: number,
    readonly cachedTokens: number,
    readonly costUsd: Decimal,
    readonly validForDate: Date | null,
    readonly createdAt: Date,
  ) {}

  toSnapshot(): Record<string, unknown> {
    return {
      id: this.id,
      organizationId: this.organizationId,
      kind: this.kind,
      body: this.body,
      articleId: this.articleId,
      warehouseId: this.warehouseId,
      modelUsed: this.modelUsed,
      tokensIn: this.tokensIn,
      tokensOut: this.tokensOut,
      cachedTokens: this.cachedTokens,
      costUsd: this.costUsd.toFixed(6),
      validForDate: this.validForDate?.toISOString() ?? null,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
