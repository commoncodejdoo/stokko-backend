import { Decimal } from 'decimal.js';
import { TxClient } from '../common/transaction';
import { Procurement } from './procurement.domain';

export interface CreateProcurementItemInput {
  articleId: string;
  quantity: Decimal;
  purchasePrice: Decimal;
}

export interface CreateProcurementInput {
  organizationId: string;
  supplierId: string;
  warehouseId: string;
  createdById: string;
  note?: string | null;
  items: CreateProcurementItemInput[];
}

export interface ListProcurementsFilter {
  organizationId: string;
  supplierId?: string;
  warehouseId?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedProcurements {
  items: Procurement[];
  total: number;
}

export abstract class ProcurementsRepository {
  abstract create(
    input: CreateProcurementInput,
    currency: string,
    tx?: TxClient,
  ): Promise<Procurement>;

  abstract findById(id: string, currency: string, tx?: TxClient): Promise<Procurement | null>;

  abstract list(
    filter: ListProcurementsFilter,
    currency: string,
    tx?: TxClient,
  ): Promise<PaginatedProcurements>;

  /**
   * Count of procurements in an org with `createdAt >= since`.
   * Used by the dashboard to compute today's procurement count without
   * paying for full row hydration.
   */
  abstract countCreatedSince(
    organizationId: string,
    since: Date,
    tx?: TxClient,
  ): Promise<number>;
}
