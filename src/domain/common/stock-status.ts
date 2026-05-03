import { Decimal } from 'decimal.js';

/**
 * Stock-level status used by both backend status calculations and the
 * mobile UI's coloured badges.
 */
export enum StockStatus {
  OK = 'OK',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Computes the status for a given quantity against an article's
 * thresholds. Both thresholds are inclusive on the lower side:
 *
 *   qty <= thresholdCritical → CRITICAL
 *   qty <= thresholdWarning  → WARNING
 *   otherwise                → OK
 */
export function computeStockStatus(
  quantity: Decimal,
  thresholdWarning: Decimal,
  thresholdCritical: Decimal,
): StockStatus {
  if (quantity.lessThanOrEqualTo(thresholdCritical)) return StockStatus.CRITICAL;
  if (quantity.lessThanOrEqualTo(thresholdWarning)) return StockStatus.WARNING;
  return StockStatus.OK;
}
