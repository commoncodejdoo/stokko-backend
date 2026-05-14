import { DomainValidationError } from '../common/errors';

const HEX_RX = /^#[0-9a-fA-F]{6}$/;

export const WAREHOUSE_KINDS = ['STORAGE', 'FOH'] as const;
export type WarehouseKind = (typeof WAREHOUSE_KINDS)[number];

export class Warehouse {
  constructor(
    readonly id: string,
    readonly organizationId: string,
    readonly name: string,
    readonly color: string,
    readonly kind: WarehouseKind,
    readonly deletedAt: Date | null,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {
    if (!name?.trim()) {
      throw new DomainValidationError('Warehouse name is required');
    }
    if (!HEX_RX.test(color)) {
      throw new DomainValidationError(`Invalid hex color: "${color}"`, { color });
    }
  }

  isFoh(): boolean {
    return this.kind === 'FOH';
  }

  /** Two-letter abbreviation for the warehouse avatar tile (e.g. "GM" for "Glavni magacin"). */
  initials(): string {
    const words = this.name.trim().split(/\s+/);
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  toSnapshot(): Record<string, unknown> {
    return {
      id: this.id,
      organizationId: this.organizationId,
      name: this.name,
      color: this.color,
      kind: this.kind,
      deletedAt: this.deletedAt?.toISOString() ?? null,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
