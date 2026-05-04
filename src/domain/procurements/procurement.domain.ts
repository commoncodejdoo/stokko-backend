import { DomainValidationError } from '../common/errors';
import { Money } from '../common/money';
import { ProcurementItem } from './procurement-item.domain';

/**
 * Procurement — the receipt of goods from a supplier into a warehouse.
 *
 * Immutable once created (no edit / delete in the MVP — corrections are
 * the way to fix mistakes). Holds the items that were received.
 */
export class Procurement {
  constructor(
    readonly id: string,
    readonly organizationId: string,
    readonly supplierId: string | null,
    readonly warehouseId: string,
    readonly createdById: string,
    readonly note: string | null,
    readonly createdAt: Date,
    readonly items: ProcurementItem[],
    readonly currency: string,
  ) {
    if (items.length === 0) {
      throw new DomainValidationError('Procurement must have at least one item');
    }
    for (const item of items) {
      if (item.purchasePrice.currency !== currency) {
        throw new DomainValidationError('All items must share the procurement currency', {
          item: item.id,
          itemCurrency: item.purchasePrice.currency,
          expected: currency,
        });
      }
    }
  }

  totalValue(): Money {
    return this.items.reduce<Money>(
      (sum, item) => sum.add(item.lineTotal()),
      new Money(0, this.currency),
    );
  }

  toSnapshot(): Record<string, unknown> {
    return {
      id: this.id,
      organizationId: this.organizationId,
      supplierId: this.supplierId,
      warehouseId: this.warehouseId,
      createdById: this.createdById,
      note: this.note,
      createdAt: this.createdAt.toISOString(),
      currency: this.currency,
      items: this.items.map((i) => i.toSnapshot()),
      totalValue: this.totalValue().toFixed(),
    };
  }
}
