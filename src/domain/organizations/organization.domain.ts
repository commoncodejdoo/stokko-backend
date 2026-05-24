import { DomainValidationError } from '../common/errors';

/**
 * Organization — the tenant entity. Every business resource (Article,
 * Warehouse, Supplier...) is scoped to exactly one Organization.
 *
 * Created via the super-admin CLI script. Owner credentials are minted
 * at the same time.
 */
export class Organization {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly currency: string,
    readonly isActive: boolean,
    /** Default supplier lead time in days — used by predictions rules engine. */
    readonly defaultLeadTimeDays: number,
    /** Safety stock buffer in days. */
    readonly defaultSafetyDays: number,
    /** Coverage target in days when computing suggestedQty. */
    readonly defaultCoverageDays: number,
    /** When false, price inputs become optional and prices/revenue are hidden in the UI. */
    readonly priceTrackingEnabled: boolean,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {
    if (!name?.trim()) {
      throw new DomainValidationError('Organization name is required');
    }
    if (!/^[A-Z]{3}$/.test(currency)) {
      throw new DomainValidationError(
        `Invalid ISO 4217 currency code: "${currency}"`,
        { currency },
      );
    }
    if (defaultLeadTimeDays < 0 || defaultSafetyDays < 0 || defaultCoverageDays < 0) {
      throw new DomainValidationError('Reorder defaults cannot be negative');
    }
  }

  toSnapshot(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      currency: this.currency,
      isActive: this.isActive,
      defaultLeadTimeDays: this.defaultLeadTimeDays,
      defaultSafetyDays: this.defaultSafetyDays,
      defaultCoverageDays: this.defaultCoverageDays,
      priceTrackingEnabled: this.priceTrackingEnabled,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
