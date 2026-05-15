import { Decimal } from 'decimal.js';
import { Urgency } from './prediction-snapshot.domain';

/**
 * Pure functions — no Prisma, no I/O. Easy to unit-test.
 *
 * Industry-standard inventory math:
 *   - daysOfSupply = currentStock / avgDailyConsumption  (null when signal missing)
 *   - shouldReorder when stock falls below the reorder point
 *                   = currentStock <= leadTime + safety days of supply
 *                   OR stock <= thresholdCritical (hard floor)
 *   - suggestedQty   = max(coverageDays * avgDaily - currentStock, 0)
 */

export interface RulesInput {
  currentStock: Decimal;
  thresholdWarning: Decimal;
  thresholdCritical: Decimal;
  /** null when no usable consumption signal is available. */
  avgDailyConsumption: Decimal | null;
  leadTimeDays: number;
  safetyDays: number;
  coverageDays: number;
}

export interface RulesResult {
  daysOfSupply: Decimal | null;
  shouldReorder: boolean;
  suggestedQty: Decimal;
  urgency: Urgency;
}

export function computeRules(input: RulesInput): RulesResult {
  const daysOfSupply = computeDaysOfSupply(input.currentStock, input.avgDailyConsumption);
  const urgency = computeUrgency(input, daysOfSupply);
  const shouldReorder = computeShouldReorder(input, daysOfSupply);
  const suggestedQty = computeSuggestedQty(input);
  return { daysOfSupply, shouldReorder, suggestedQty, urgency };
}

export function computeDaysOfSupply(
  stock: Decimal,
  avgDaily: Decimal | null,
): Decimal | null {
  if (!avgDaily || avgDaily.isNegative() || avgDaily.isZero()) return null;
  return stock.div(avgDaily);
}

export function computeUrgency(
  input: Pick<RulesInput, 'currentStock' | 'thresholdCritical' | 'thresholdWarning'>,
  daysOfSupply: Decimal | null,
): Urgency {
  if (input.currentStock.lessThanOrEqualTo(input.thresholdCritical)) return 'CRITICAL';
  if (daysOfSupply && daysOfSupply.lessThanOrEqualTo(2)) return 'CRITICAL';
  if (input.currentStock.lessThanOrEqualTo(input.thresholdWarning)) return 'WARNING';
  if (daysOfSupply && daysOfSupply.lessThanOrEqualTo(5)) return 'WARNING';
  return 'OK';
}

export function computeShouldReorder(
  input: Pick<RulesInput, 'currentStock' | 'thresholdCritical' | 'leadTimeDays' | 'safetyDays'>,
  daysOfSupply: Decimal | null,
): boolean {
  if (input.currentStock.lessThanOrEqualTo(input.thresholdCritical)) return true;
  if (!daysOfSupply) return false;
  const reorderPointDays = new Decimal(input.leadTimeDays + input.safetyDays);
  return daysOfSupply.lessThanOrEqualTo(reorderPointDays);
}

export function computeSuggestedQty(input: RulesInput): Decimal {
  if (!input.avgDailyConsumption || input.avgDailyConsumption.isZero()) {
    // Without a consumption signal we target restoring stock to thresholdWarning.
    const gap = input.thresholdWarning.minus(input.currentStock);
    return Decimal.max(gap, new Decimal(0));
  }
  const target = input.avgDailyConsumption.times(input.coverageDays);
  const gap = target.minus(input.currentStock);
  // Round up to whole units — restaurants order in whole bottles/boxes.
  return Decimal.max(gap, new Decimal(0)).ceil();
}
