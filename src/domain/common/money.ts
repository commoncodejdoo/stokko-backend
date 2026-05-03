import { Decimal } from 'decimal.js';
import { DomainValidationError } from './errors';

const ISO_CURRENCY_RX = /^[A-Z]{3}$/;

/**
 * Money value object — a non-negative `Decimal` paired with an ISO 4217
 * currency code. Arithmetic guards against mixing currencies.
 *
 * Article prices are stored as `Decimal` in the database; the currency
 * is held on the owning `Organization`. The data-layer mapper attaches
 * the org's currency when constructing the domain model.
 */
export class Money {
  readonly amount: Decimal;
  readonly currency: string;

  constructor(amount: Decimal | string | number, currency: string) {
    const dec = amount instanceof Decimal ? amount : new Decimal(amount);
    if (dec.isNegative()) {
      throw new DomainValidationError('Money amount cannot be negative', {
        amount: dec.toFixed(),
      });
    }
    if (!ISO_CURRENCY_RX.test(currency)) {
      throw new DomainValidationError(`Invalid ISO 4217 currency code: "${currency}"`, {
        currency,
      });
    }
    this.amount = dec;
    this.currency = currency;
  }

  add(other: Money): Money {
    this.requireSameCurrency(other);
    return new Money(this.amount.plus(other.amount), this.currency);
  }

  multiply(factor: Decimal | string | number): Money {
    const f = factor instanceof Decimal ? factor : new Decimal(factor);
    return new Money(this.amount.times(f), this.currency);
  }

  equals(other: Money): boolean {
    return this.currency === other.currency && this.amount.equals(other.amount);
  }

  toString(): string {
    return `${this.amount.toFixed(2)} ${this.currency}`;
  }

  /** Raw decimal string — useful for serialization to API responses. */
  toFixed(): string {
    return this.amount.toFixed(2);
  }

  private requireSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new DomainValidationError(
        `Currency mismatch: ${this.currency} vs ${other.currency}`,
        { left: this.currency, right: other.currency },
      );
    }
  }
}
