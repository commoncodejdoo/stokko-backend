import { Decimal } from 'decimal.js';
import { DomainValidationError } from '../common/errors';

export enum CorrectionType {
  ABSOLUTE = 'ABSOLUTE',
  DELTA = 'DELTA',
}

export enum CorrectionReason {
  COUNT = 'COUNT',
  WRITE_OFF = 'WRITE_OFF',
  INPUT_ERROR = 'INPUT_ERROR',
  OTHER = 'OTHER',
}

/**
 * StockCorrection — an immutable record of a manual stock adjustment.
 *
 * Two flavours:
 *  - ABSOLUTE: `value` is the new stock level (must be >= 0)
 *  - DELTA:    `value` is the signed change to apply (may be negative)
 *
 * Created by an inventory count, write-off, or to fix a data-entry mistake.
 * The actual stock mutation lives in `StockService` — this entity captures
 * the *intent* and is what audit logs reference.
 */
export class StockCorrection {
  readonly value: Decimal;

  constructor(
    readonly id: string,
    readonly organizationId: string,
    readonly articleId: string,
    readonly warehouseId: string,
    readonly type: CorrectionType,
    value: Decimal | string | number,
    readonly reason: CorrectionReason,
    readonly note: string | null,
    readonly createdById: string,
    readonly createdAt: Date,
  ) {
    const dec = value instanceof Decimal ? value : new Decimal(value);
    if (type === CorrectionType.ABSOLUTE && dec.isNegative()) {
      throw new DomainValidationError(
        'ABSOLUTE correction value must be >= 0',
        { value: dec.toFixed() },
      );
    }
    if (type === CorrectionType.DELTA && dec.isZero()) {
      throw new DomainValidationError('DELTA correction value cannot be zero');
    }
    this.value = dec;
  }

  /**
   * Computes the new stock quantity given the current quantity in the
   * warehouse. ABSOLUTE replaces, DELTA adds.
   */
  applyTo(currentQuantity: Decimal): Decimal {
    if (this.type === CorrectionType.ABSOLUTE) return this.value;
    return currentQuantity.plus(this.value);
  }

  /**
   * Signed change vs. the current quantity. Useful for audit snapshots:
   *  - ABSOLUTE 20 with current 24 → -4
   *  - DELTA -3 with any current   → -3
   */
  deltaFrom(currentQuantity: Decimal): Decimal {
    if (this.type === CorrectionType.ABSOLUTE) {
      return this.value.minus(currentQuantity);
    }
    return this.value;
  }

  toSnapshot(): Record<string, unknown> {
    return {
      id: this.id,
      organizationId: this.organizationId,
      articleId: this.articleId,
      warehouseId: this.warehouseId,
      type: this.type,
      value: this.value.toFixed(3),
      reason: this.reason,
      note: this.note,
      createdById: this.createdById,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
