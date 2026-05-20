import type { WarehouseStockTarget as Row } from '@prisma/client';
import { Decimal } from 'decimal.js';
import { WarehouseStockTarget } from '../../domain/warehouse-stock-targets/warehouse-stock-target.domain';

export class WarehouseStockTargetsMapper {
  toDomain(row: Row): WarehouseStockTarget {
    return new WarehouseStockTarget(
      row.warehouseId,
      row.articleId,
      new Decimal(row.targetQty.toFixed()),
      row.createdAt,
      row.updatedAt,
    );
  }
}
