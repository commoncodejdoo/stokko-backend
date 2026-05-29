import { DomainValidationError } from '../common/errors';
import { Unit } from '../common/unit';

/**
 * Global, cross-tenant barcode catalogue entry. Lives outside any single
 * organisation — `firstSeenOrgId` and `usingOrgIds` are platform-internal
 * tracking fields and must never be exposed via the public HTTP API.
 *
 * Consumers (mobile barcode scanner) only ever see the `suggested*` fields
 * via `toPublicSnapshot()` so an org cannot infer which other tenants use
 * a given barcode.
 */
export class BarcodeRegistry {
  constructor(
    readonly barcode: string,
    readonly suggestedName: string,
    readonly suggestedBrand: string | null,
    readonly suggestedCategoryName: string | null,
    readonly suggestedUnit: Unit,
    readonly firstSeenOrgId: string,
    readonly firstSeenAt: Date,
    readonly lastSeenAt: Date,
    readonly usingOrgIds: string[],
  ) {
    if (!barcode?.trim()) throw new DomainValidationError('Barcode is required');
    if (!suggestedName?.trim()) {
      throw new DomainValidationError('suggestedName is required');
    }
  }

  /** Safe shape for the public lookup endpoint. */
  toPublicSnapshot(): Record<string, unknown> {
    return {
      barcode: this.barcode,
      suggestedName: this.suggestedName,
      suggestedBrand: this.suggestedBrand,
      suggestedCategoryName: this.suggestedCategoryName,
      suggestedUnit: this.suggestedUnit,
      firstSeenAt: this.firstSeenAt.toISOString(),
      lastSeenAt: this.lastSeenAt.toISOString(),
    };
  }
}
