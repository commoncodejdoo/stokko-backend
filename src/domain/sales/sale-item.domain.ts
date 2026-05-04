import { Decimal } from 'decimal.js';
import { DomainValidationError } from '../common/errors';
import { Money } from '../common/money';

/**
 * A single line on a Sale — captures qty + unit price snapshot at the
 * time of sale. Article.salePrice may drift afterwards; what was actually
 * charged is preserved here.
 */
export class SaleItem {
  readonly quantity: Decimal;

  constructor(
    readonly id: string,
    readonly saleId: string,
    readonly articleId: string,
    quantity: Decimal | string | number,
    readonly unitPrice: Money,
  ) {
    const qty = quantity instanceof Decimal ? quantity : new Decimal(quantity);
    if (qty.isNegative() || qty.isZero()) {
      throw new DomainValidationError('Sale item quantity must be > 0', {
        articleId,
        quantity: qty.toFixed(),
      });
    }
    this.quantity = qty;
  }

  lineTotal(): Money {
    return this.unitPrice.multiply(this.quantity);
  }

  toSnapshot(): Record<string, unknown> {
    return {
      id: this.id,
      saleId: this.saleId,
      articleId: this.articleId,
      quantity: this.quantity.toFixed(3),
      unitPrice: this.unitPrice.toFixed(),
      currency: this.unitPrice.currency,
    };
  }
}
