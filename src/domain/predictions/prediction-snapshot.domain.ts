import { Decimal } from 'decimal.js';

export type Urgency = 'CRITICAL' | 'WARNING' | 'OK';

/**
 * Output of the rules engine for a single (warehouse, article) at a point in time.
 *
 * The cron writes a new row per (org, warehouse, article) per recompute.
 * UI reads the latest via PredictionsRepository.listLatest.
 */
export class PredictionSnapshot {
  constructor(
    readonly id: string,
    readonly organizationId: string,
    readonly warehouseId: string,
    readonly articleId: string,
    readonly currentStock: Decimal,
    readonly avgDailyConsumption: Decimal | null,
    readonly daysOfSupply: Decimal | null,
    readonly shouldReorder: boolean,
    readonly suggestedQty: Decimal,
    readonly urgency: Urgency,
    readonly leadTimeDaysUsed: number,
    readonly safetyDaysUsed: number,
    readonly coverageDaysUsed: number,
    readonly signalWindowDays: number,
    readonly computedAt: Date,
    readonly validUntil: Date,
  ) {}

  isCritical(): boolean {
    return this.urgency === 'CRITICAL';
  }

  toSnapshot(): Record<string, unknown> {
    return {
      id: this.id,
      organizationId: this.organizationId,
      warehouseId: this.warehouseId,
      articleId: this.articleId,
      currentStock: this.currentStock.toFixed(3),
      avgDailyConsumption: this.avgDailyConsumption?.toFixed(3) ?? null,
      daysOfSupply: this.daysOfSupply?.toFixed(2) ?? null,
      shouldReorder: this.shouldReorder,
      suggestedQty: this.suggestedQty.toFixed(3),
      urgency: this.urgency,
      leadTimeDaysUsed: this.leadTimeDaysUsed,
      safetyDaysUsed: this.safetyDaysUsed,
      coverageDaysUsed: this.coverageDaysUsed,
      signalWindowDays: this.signalWindowDays,
      computedAt: this.computedAt.toISOString(),
      validUntil: this.validUntil.toISOString(),
    };
  }
}
