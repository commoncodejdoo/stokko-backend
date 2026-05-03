import { Decimal } from 'decimal.js';
import { DomainValidationError } from '../common/errors';

/**
 * StockEntry — quantity of a single article in a single warehouse.
 * The PK is composite (articleId, warehouseId).
 */
export class StockEntry {
  readonly quantity: Decimal;

  constructor(
    readonly articleId: string,
    readonly warehouseId: string,
    quantity: Decimal | string | number,
    readonly updatedAt: Date,
  ) {
    const dec = quantity instanceof Decimal ? quantity : new Decimal(quantity);
    if (dec.isNegative()) {
      throw new DomainValidationError('Stock quantity cannot be negative', {
        articleId,
        warehouseId,
        quantity: dec.toFixed(),
      });
    }
    this.quantity = dec;
  }

  toSnapshot(): Record<string, unknown> {
    return {
      articleId: this.articleId,
      warehouseId: this.warehouseId,
      quantity: this.quantity.toFixed(3),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
