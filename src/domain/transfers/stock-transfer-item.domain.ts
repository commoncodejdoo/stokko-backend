import { Decimal } from 'decimal.js';
import { DomainValidationError } from '../common/errors';

/**
 * A single line on a StockTransfer.
 *
 * Records the quantity moved from the source warehouse to the destination
 * warehouse. Quantities are always positive — direction is encoded by the
 * parent transfer's source/destination fields.
 */
export class StockTransferItem {
  readonly quantity: Decimal;

  constructor(
    readonly id: string,
    readonly transferId: string,
    readonly articleId: string,
    quantity: Decimal | string | number,
  ) {
    const qty = quantity instanceof Decimal ? quantity : new Decimal(quantity);
    if (qty.isNegative() || qty.isZero()) {
      throw new DomainValidationError('Transfer item quantity must be > 0', {
        articleId,
        quantity: qty.toFixed(),
      });
    }
    this.quantity = qty;
  }

  toSnapshot(): Record<string, unknown> {
    return {
      id: this.id,
      transferId: this.transferId,
      articleId: this.articleId,
      quantity: this.quantity.toFixed(3),
    };
  }
}
