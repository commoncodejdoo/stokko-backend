import { TxClient } from '../common/transaction';

export interface UserWarehouseAccessRecord {
  userId: string;
  warehouseId: string;
  createdAt: Date;
}

export abstract class UserWarehouseAccessRepository {
  abstract listForUser(userId: string, tx?: TxClient): Promise<UserWarehouseAccessRecord[]>;
  abstract listForWarehouse(
    warehouseId: string,
    tx?: TxClient,
  ): Promise<UserWarehouseAccessRecord[]>;
  abstract grant(userId: string, warehouseId: string, tx?: TxClient): Promise<UserWarehouseAccessRecord>;
  abstract revoke(userId: string, warehouseId: string, tx?: TxClient): Promise<void>;
}
