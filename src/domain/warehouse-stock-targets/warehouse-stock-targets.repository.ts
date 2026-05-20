import { Decimal } from 'decimal.js';
import { TxClient } from '../common/transaction';
import { WarehouseStockTarget } from './warehouse-stock-target.domain';

export interface UpsertTargetInput {
  warehouseId: string;
  articleId: string;
  targetQty: Decimal;
}

export abstract class WarehouseStockTargetsRepository {
  abstract listByWarehouse(warehouseId: string, tx?: TxClient): Promise<WarehouseStockTarget[]>;
  abstract findOne(
    warehouseId: string,
    articleId: string,
    tx?: TxClient,
  ): Promise<WarehouseStockTarget | null>;
  abstract upsert(input: UpsertTargetInput, tx?: TxClient): Promise<WarehouseStockTarget>;
  abstract delete(warehouseId: string, articleId: string, tx?: TxClient): Promise<void>;
}
