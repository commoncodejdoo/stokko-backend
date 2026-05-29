import { Injectable } from '@nestjs/common';
import { TxClient } from '../common/transaction';
import { BarcodeRegistry } from './barcode-registry.domain';
import {
  BarcodeRegistryRepository,
  UpsertBarcodeRegistryInput,
} from './barcode-registry.repository';

@Injectable()
export class BarcodeRegistryService {
  constructor(private readonly repo: BarcodeRegistryRepository) {}

  /** Public lookup used by the mobile scanner (`GET /barcode-registry/:barcode`). */
  async lookup(barcode: string, tx?: TxClient): Promise<BarcodeRegistry | null> {
    const trimmed = barcode?.trim();
    if (!trimmed) return null;
    return this.repo.findByBarcode(trimmed, tx);
  }

  /**
   * Called from `ArticlesService.create` and `ArticlesService.update` inside
   * the same transaction whenever an Article is saved with a barcode.
   * Adds the org to `usingOrgIds` (Set semantics) and refreshes catalogue
   * suggestions from the most recent article save.
   */
  async upsertOnArticleSave(
    input: UpsertBarcodeRegistryInput,
    tx?: TxClient,
  ): Promise<void> {
    await this.repo.upsert(input, tx);
  }
}
