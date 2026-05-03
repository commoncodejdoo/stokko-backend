import { Decimal } from 'decimal.js';
import { DomainValidationError } from '../common/errors';
import { Money } from '../common/money';

/**
 * A single line on a Procurement document.
 *
 * Records the *historical* purchase price at the time of receipt. The
 * Article's default `purchasePrice` may have changed since; this captures
 * what was actually paid.
 */
export class ProcurementItem {
  readonly quantity: Decimal;

  constructor(
    readonly id: string,
    readonly procurementId: string,
    readonly articleId: string,
    quantity: Decimal | string | number,
    readonly purchasePrice: Money,
  ) {
    const qty = quantity instanceof Decimal ? quantity : new Decimal(quantity);
    if (qty.isNegative() || qty.isZero()) {
      throw new DomainValidationError('Procurement item quantity must be > 0', {
        articleId,
        quantity: qty.toFixed(),
      });
    }
    this.quantity = qty;
  }

  /** Money — quantity × unit price. */
  lineTotal(): Money {
    return this.purchasePrice.multiply(this.quantity);
  }

  toSnapshot(): Record<string, unknown> {
    return {
      id: this.id,
      procurementId: this.procurementId,
      articleId: this.articleId,
      quantity: this.quantity.toFixed(3),
      purchasePrice: this.purchasePrice.toFixed(),
      currency: this.purchasePrice.currency,
    };
  }
}
