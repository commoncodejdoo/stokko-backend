import { Decimal } from 'decimal.js';
import { DomainValidationError } from '../common/errors';
import { Money } from '../common/money';
import { computeStockStatus, StockStatus } from '../common/stock-status';
import { Unit } from '../common/unit';

export class Article {
  readonly thresholdWarning: Decimal;
  readonly thresholdCritical: Decimal;

  constructor(
    readonly id: string,
    readonly organizationId: string,
    readonly sku: string,
    readonly name: string,
    readonly purchasePrice: Money,
    readonly salePrice: Money,
    readonly unit: Unit,
    readonly categoryId: string,
    readonly supplierId: string | null,
    thresholdWarning: Decimal | string | number,
    thresholdCritical: Decimal | string | number,
    readonly createdById: string,
    readonly deletedAt: Date | null,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {
    if (!sku?.trim()) throw new DomainValidationError('SKU is required');
    if (!name?.trim()) throw new DomainValidationError('Article name is required');

    const warn = thresholdWarning instanceof Decimal ? thresholdWarning : new Decimal(thresholdWarning);
    const crit = thresholdCritical instanceof Decimal ? thresholdCritical : new Decimal(thresholdCritical);
    if (warn.isNegative() || crit.isNegative()) {
      throw new DomainValidationError('Thresholds cannot be negative');
    }
    if (crit.greaterThan(warn)) {
      throw new DomainValidationError(
        `thresholdCritical (${crit.toFixed()}) must be <= thresholdWarning (${warn.toFixed()})`,
        { thresholdCritical: crit.toFixed(), thresholdWarning: warn.toFixed() },
      );
    }
    if (purchasePrice.currency !== salePrice.currency) {
      throw new DomainValidationError('purchasePrice and salePrice currencies must match');
    }

    this.thresholdWarning = warn;
    this.thresholdCritical = crit;
  }

  /** Returns the status for a specific warehouse's quantity. */
  status(quantity: Decimal | string | number): StockStatus {
    const qty = quantity instanceof Decimal ? quantity : new Decimal(quantity);
    return computeStockStatus(qty, this.thresholdWarning, this.thresholdCritical);
  }

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  toSnapshot(): Record<string, unknown> {
    return {
      id: this.id,
      organizationId: this.organizationId,
      sku: this.sku,
      name: this.name,
      purchasePrice: this.purchasePrice.toFixed(),
      salePrice: this.salePrice.toFixed(),
      currency: this.purchasePrice.currency,
      unit: this.unit,
      categoryId: this.categoryId,
      supplierId: this.supplierId,
      thresholdWarning: this.thresholdWarning.toFixed(3),
      thresholdCritical: this.thresholdCritical.toFixed(3),
      createdById: this.createdById,
      deletedAt: this.deletedAt?.toISOString() ?? null,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
