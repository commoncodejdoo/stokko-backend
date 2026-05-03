import { DomainValidationError } from '../common/errors';

/**
 * Supplier — referenced by Article (optional) and Procurement (required).
 *
 * Phase 2 ships the model + service skeleton needed for Article FK
 * resolution. The full supplier admin UI + controller comes in Phase 3.
 */
export class Supplier {
  constructor(
    readonly id: string,
    readonly organizationId: string,
    readonly name: string,
    readonly contactPerson: string | null,
    readonly phone: string | null,
    readonly email: string | null,
    readonly note: string | null,
    readonly deletedAt: Date | null,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {
    if (!name?.trim()) {
      throw new DomainValidationError('Supplier name is required');
    }
  }

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  toSnapshot(): Record<string, unknown> {
    return {
      id: this.id,
      organizationId: this.organizationId,
      name: this.name,
      contactPerson: this.contactPerson,
      phone: this.phone,
      email: this.email,
      note: this.note,
      deletedAt: this.deletedAt?.toISOString() ?? null,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
