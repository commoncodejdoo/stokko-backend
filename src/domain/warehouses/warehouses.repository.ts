import { TxClient } from '../common/transaction';
import { Warehouse, WarehouseKind } from './warehouse.domain';

export interface CreateWarehouseInput {
  organizationId: string;
  name: string;
  color: string;
  kind?: WarehouseKind;
}

export interface UpdateWarehouseInput {
  name?: string;
  color?: string;
  kind?: WarehouseKind;
}

export abstract class WarehousesRepository {
  abstract create(input: CreateWarehouseInput, tx?: TxClient): Promise<Warehouse>;
  abstract findById(id: string, tx?: TxClient): Promise<Warehouse | null>;
  abstract findByName(
    organizationId: string,
    name: string,
    tx?: TxClient,
  ): Promise<Warehouse | null>;
  abstract listByOrg(organizationId: string, tx?: TxClient): Promise<Warehouse[]>;
  abstract update(id: string, patch: UpdateWarehouseInput, tx?: TxClient): Promise<Warehouse>;
  abstract softDelete(id: string, tx?: TxClient): Promise<Warehouse>;
}
