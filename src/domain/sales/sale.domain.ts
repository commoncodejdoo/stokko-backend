import { Decimal } from 'decimal.js';
import { DomainValidationError } from '../common/errors';
import { Money } from '../common/money';
import { SaleItem } from './sale-item.domain';

/**
 * Sale — single transaction recorded at shift close, scoped to a single
 * FOH warehouse. Multiple Sales may belong to one Shift (one per
 * FOH location closed in the same Obračun).
 */
export class Sale {
  constructor(
    readonly id: string,
    readonly organizationId: string,
    readonly shiftId: string,
    readonly warehouseId: string,
    readonly createdById: string,
    readonly createdAt: Date,
    readonly items: SaleItem[],
    readonly currency: string,
  ) {
    if (items.length === 0) {
      throw new DomainValidationError('Sale must have at least one item');
    }
    for (const it of items) {
      if (it.unitPrice.currency !== currency) {
        throw new DomainValidationError('All items must share the sale currency', {
          item: it.id,
          itemCurrency: it.unitPrice.currency,
          expected: currency,
        });
      }
    }
  }

  totalQuantity(): Decimal {
    return this.items.reduce<Decimal>(
      (sum, i) => sum.plus(i.quantity),
      new Decimal(0),
    );
  }

  totalRevenue(): Money {
    return this.items.reduce<Money>(
      (sum, i) => sum.add(i.lineTotal()),
      new Money(0, this.currency),
    );
  }

  toSnapshot(): Record<string, unknown> {
    return {
      id: this.id,
      organizationId: this.organizationId,
      shiftId: this.shiftId,
      warehouseId: this.warehouseId,
      createdById: this.createdById,
      createdAt: this.createdAt.toISOString(),
      currency: this.currency,
      items: this.items.map((i) => i.toSnapshot()),
      totalQuantity: this.totalQuantity().toFixed(3),
      totalRevenue: this.totalRevenue().toFixed(),
    };
  }
}
