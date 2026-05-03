import { Decimal } from 'decimal.js';
import { TxClient } from '../common/transaction';
import {
  CorrectionReason,
  CorrectionType,
  StockCorrection,
} from './correction.domain';

export interface CreateCorrectionInput {
  organizationId: string;
  articleId: string;
  warehouseId: string;
  type: CorrectionType;
  value: Decimal;
  reason: CorrectionReason;
  note?: string | null;
  createdById: string;
}

export interface ListCorrectionsFilter {
  organizationId: string;
  articleId?: string;
  warehouseId?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedCorrections {
  items: StockCorrection[];
  total: number;
}

export abstract class CorrectionsRepository {
  abstract create(input: CreateCorrectionInput, tx?: TxClient): Promise<StockCorrection>;

  abstract findById(id: string, tx?: TxClient): Promise<StockCorrection | null>;

  abstract list(
    filter: ListCorrectionsFilter,
    tx?: TxClient,
  ): Promise<PaginatedCorrections>;
}
