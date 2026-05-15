import { Decimal } from 'decimal.js';
import { TxClient } from '../common/transaction';
import { PredictionSnapshot, Urgency } from './prediction-snapshot.domain';

export interface CreatePredictionSnapshotInput {
  organizationId: string;
  warehouseId: string;
  articleId: string;
  currentStock: Decimal;
  avgDailyConsumption: Decimal | null;
  daysOfSupply: Decimal | null;
  shouldReorder: boolean;
  suggestedQty: Decimal;
  urgency: Urgency;
  leadTimeDaysUsed: number;
  safetyDaysUsed: number;
  coverageDaysUsed: number;
  signalWindowDays: number;
  validUntil: Date;
}

export interface ListCurrentSnapshotsFilter {
  organizationId: string;
  warehouseId?: string;
  urgency?: Urgency;
  shouldReorderOnly?: boolean;
}

export abstract class PredictionsRepository {
  abstract create(
    input: CreatePredictionSnapshotInput,
    tx?: TxClient,
  ): Promise<PredictionSnapshot>;

  /**
   * For each (warehouseId, articleId) tuple, return the latest snapshot
   * scoped to the org. Filters applied after the latest-per-tuple resolution.
   */
  abstract listLatest(
    filter: ListCurrentSnapshotsFilter,
    tx?: TxClient,
  ): Promise<PredictionSnapshot[]>;

  abstract findLatestForArticleWarehouse(
    organizationId: string,
    articleId: string,
    warehouseId: string,
    tx?: TxClient,
  ): Promise<PredictionSnapshot | null>;
}
