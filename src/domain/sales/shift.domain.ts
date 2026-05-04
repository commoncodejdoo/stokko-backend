import { Decimal } from 'decimal.js';
import { Money } from '../common/money';

export type ShiftStatus = 'OPEN' | 'CLOSED';

/**
 * Shift — one per (organization, date) by DB constraint. A shift opens
 * implicitly on first sale of the day and closes when the user submits
 * Obračun. Carries denormalised totals (sum across all sales) for fast
 * dashboard reads.
 */
export class Shift {
  constructor(
    readonly id: string,
    readonly organizationId: string,
    readonly date: Date,
    readonly openedAt: Date,
    readonly closedAt: Date | null,
    readonly closedById: string | null,
    readonly status: ShiftStatus,
    readonly totalQuantity: Decimal,
    readonly totalRevenue: Money,
  ) {}

  isClosed(): boolean {
    return this.status === 'CLOSED';
  }

  toSnapshot(): Record<string, unknown> {
    return {
      id: this.id,
      organizationId: this.organizationId,
      date: this.date.toISOString(),
      openedAt: this.openedAt.toISOString(),
      closedAt: this.closedAt?.toISOString() ?? null,
      closedById: this.closedById,
      status: this.status,
      totalQuantity: this.totalQuantity.toFixed(3),
      totalRevenue: this.totalRevenue.toFixed(),
      currency: this.totalRevenue.currency,
    };
  }
}
