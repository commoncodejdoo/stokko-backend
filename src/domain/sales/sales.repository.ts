import { Decimal } from 'decimal.js';
import { TxClient } from '../common/transaction';
import { Sale } from './sale.domain';
import { Shift } from './shift.domain';

export interface CreateSaleItemInput {
  articleId: string;
  quantity: Decimal;
  unitPrice: Decimal;
}

export interface CreateSaleInput {
  organizationId: string;
  shiftId: string;
  warehouseId: string;
  createdById: string;
  items: CreateSaleItemInput[];
}

export interface UpsertShiftInput {
  organizationId: string;
  /** Date at midnight UTC. */
  date: Date;
}

export interface CloseShiftInput {
  shiftId: string;
  closedById: string;
  totalQuantity: Decimal;
  totalRevenueAmount: Decimal;
}

export interface ListShiftsFilter {
  organizationId: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedShifts {
  items: Shift[];
  total: number;
}

export interface ShiftWithSales {
  shift: Shift;
  sales: Sale[];
}

export abstract class SalesRepository {
  /** Insert if missing, return Shift for the given (org, date) — `OPEN` on first call. */
  abstract upsertShift(input: UpsertShiftInput, tx?: TxClient): Promise<Shift>;
  abstract findShiftById(
    id: string,
    currency: string,
    tx?: TxClient,
  ): Promise<Shift | null>;
  abstract findShiftWithSales(
    id: string,
    currency: string,
    tx?: TxClient,
  ): Promise<ShiftWithSales | null>;
  abstract listShifts(
    filter: ListShiftsFilter,
    currency: string,
    tx?: TxClient,
  ): Promise<PaginatedShifts>;
  abstract createSale(
    input: CreateSaleInput,
    currency: string,
    tx?: TxClient,
  ): Promise<Sale>;
  abstract closeShift(input: CloseShiftInput, currency: string, tx?: TxClient): Promise<Shift>;
  abstract deleteShift(id: string, tx?: TxClient): Promise<void>;
}
