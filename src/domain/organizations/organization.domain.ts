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
  }

  toSnapshot(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      currency: this.currency,
      isActive: this.isActive,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
