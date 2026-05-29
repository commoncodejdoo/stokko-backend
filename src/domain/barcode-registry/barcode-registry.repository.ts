import { TxClient } from '../common/transaction';
import { Unit } from '../common/unit';
import { BarcodeRegistry } from './barcode-registry.domain';

export interface UpsertBarcodeRegistryInput {
  barcode: string;
  suggestedName: string;
  suggestedBrand?: string | null;
  suggestedCategoryName?: string | null;
  suggestedUnit: Unit;
  orgId: string;
}

export abstract class BarcodeRegistryRepository {
  abstract findByBarcode(barcode: string, tx?: TxClient): Promise<BarcodeRegistry | null>;

  /**
   * Idempotent upsert called from `ArticlesService.create/update` inside the
   * same transaction. `usingOrgIds` is enforced as a Set (no duplicates).
   */
  abstract upsert(input: UpsertBarcodeRegistryInput, tx?: TxClient): Promise<BarcodeRegistry>;
}
