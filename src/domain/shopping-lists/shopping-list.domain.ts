import { ShoppingListItem } from './shopping-list-item.domain';

export type ShoppingListStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

/**
 * ShoppingList — collection of items to procure, derived from the latest
 * predictions snapshot. Lifecycle: DRAFT → ACTIVE → COMPLETED | CANCELLED.
 *
 * Invariant (application-level): at most ONE list per org may be in
 * DRAFT or ACTIVE state at any time.
 */
export class ShoppingList {
  constructor(
    readonly id: string,
    readonly organizationId: string,
    readonly status: ShoppingListStatus,
    readonly createdById: string,
    readonly completedById: string | null,
    readonly completedAt: Date | null,
    readonly totalEstimateCents: number,
    readonly currency: string,
    readonly generatedFromSnapshotAt: Date | null,
    readonly note: string | null,
    readonly createdAt: Date,
    readonly updatedAt: Date,
    readonly items: ShoppingListItem[] = [],
  ) {}

  isActive(): boolean {
    return this.status === 'DRAFT' || this.status === 'ACTIVE';
  }

  isCompleted(): boolean {
    return this.status === 'COMPLETED';
  }

  isCancelled(): boolean {
    return this.status === 'CANCELLED';
  }

  toSnapshot(): Record<string, unknown> {
    return {
      id: this.id,
      organizationId: this.organizationId,
      status: this.status,
      createdById: this.createdById,
      completedById: this.completedById,
      completedAt: this.completedAt?.toISOString() ?? null,
      totalEstimateCents: this.totalEstimateCents,
      currency: this.currency,
      generatedFromSnapshotAt: this.generatedFromSnapshotAt?.toISOString() ?? null,
      note: this.note,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      itemCount: this.items.length,
    };
  }
}
