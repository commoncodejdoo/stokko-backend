import { DomainValidationError } from '../common/errors';

export class Category {
  constructor(
    readonly id: string,
    readonly organizationId: string,
    readonly name: string,
    readonly isPredefined: boolean,
    readonly deletedAt: Date | null,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {
    if (!name?.trim()) {
      throw new DomainValidationError('Category name is required');
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
      isPredefined: this.isPredefined,
      deletedAt: this.deletedAt?.toISOString() ?? null,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
