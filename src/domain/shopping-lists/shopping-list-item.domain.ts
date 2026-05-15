import { Decimal } from 'decimal.js';

export class ShoppingListItem {
  constructor(
    readonly id: string,
    readonly shoppingListId: string,
    readonly articleId: string,
    readonly warehouseId: string,
    readonly suggestedQty: Decimal,
    readonly customQty: Decimal | null,
    readonly supplierId: string | null,
    readonly isChecked: boolean,
    readonly addedManually: boolean,
    readonly sortOrder: number,
    readonly estimatedPriceCents: number,
  ) {}

  /** Effective quantity to procure — customQty overrides suggestedQty if set. */
  effectiveQty(): Decimal {
    return this.customQty ?? this.suggestedQty;
  }

  toSnapshot(): Record<string, unknown> {
    return {
      id: this.id,
      shoppingListId: this.shoppingListId,
      articleId: this.articleId,
      warehouseId: this.warehouseId,
      suggestedQty: this.suggestedQty.toFixed(3),
      customQty: this.customQty?.toFixed(3) ?? null,
      supplierId: this.supplierId,
      isChecked: this.isChecked,
      addedManually: this.addedManually,
      sortOrder: this.sortOrder,
      estimatedPriceCents: this.estimatedPriceCents,
    };
  }
}
