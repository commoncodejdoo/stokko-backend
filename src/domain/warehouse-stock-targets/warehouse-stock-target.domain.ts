import { Decimal } from 'decimal.js';
import { DomainValidationError } from '../common/errors';

/**
 * Optimal target quantity for a single (article, warehouse) pair. Only FOH
 * warehouses are expected to have targets; the application service
 * enforces the warehouse kind.
 */
export class WarehouseStockTarget {
  constructor(
    public readonly warehouseId: string,
    public readonly articleId: string,
    public readonly targetQty: Decimal,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {
    if (targetQty.isNegative()) {
      throw new DomainValidationError('Target quantity must be >= 0', {
        warehouseId,
        articleId,
        targetQty: targetQty.toFixed(),
      });
    }
  }

  toSnapshot(): {
    warehouseId: string;
    articleId: string;
    targetQty: string;
    updatedAt: string;
  } {
    return {
      warehouseId: this.warehouseId,
      articleId: this.articleId,
      targetQty: this.targetQty.toFixed(3),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
