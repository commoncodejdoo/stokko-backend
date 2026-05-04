import { DomainValidationError } from '../common/errors';
import { StockTransferItem } from './stock-transfer-item.domain';

/**
 * StockTransfer — moves articles from one warehouse to another.
 *
 * Header + lines model. Immutable once created. Source ≠ destination is
 * the only structural invariant; quantity validity is enforced per item.
 */
export class StockTransfer {
  constructor(
    readonly id: string,
    readonly organizationId: string,
    readonly sourceWarehouseId: string,
    readonly destinationWarehouseId: string,
    readonly createdById: string,
    readonly note: string | null,
    readonly createdAt: Date,
    readonly items: StockTransferItem[],
  ) {
    if (sourceWarehouseId === destinationWarehouseId) {
      throw new DomainValidationError(
        'Source and destination warehouse must differ',
        { sourceWarehouseId, destinationWarehouseId },
      );
    }
    if (items.length === 0) {
      throw new DomainValidationError('Transfer must have at least one item');
    }
  }

  toSnapshot(): Record<string, unknown> {
    return {
      id: this.id,
      organizationId: this.organizationId,
      sourceWarehouseId: this.sourceWarehouseId,
      destinationWarehouseId: this.destinationWarehouseId,
      createdById: this.createdById,
      note: this.note,
      createdAt: this.createdAt.toISOString(),
      items: this.items.map((i) => i.toSnapshot()),
    };
  }
}
