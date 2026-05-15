import {
  ShoppingList as PrismaShoppingList,
  ShoppingListItem as PrismaShoppingListItem,
  ShoppingListStatus as PrismaShoppingListStatus,
} from '@prisma/client';
import { Decimal } from 'decimal.js';
import { ShoppingListItem } from '../../domain/shopping-lists/shopping-list-item.domain';
import {
  ShoppingList,
  ShoppingListStatus,
} from '../../domain/shopping-lists/shopping-list.domain';

type PrismaShoppingListWithItems = PrismaShoppingList & {
  items?: PrismaShoppingListItem[];
};

export class ShoppingListsMapper {
  toDomain(row: PrismaShoppingListWithItems): ShoppingList {
    const items = (row.items ?? []).map((i) => this.toItem(i));
    return new ShoppingList(
      row.id,
      row.organizationId,
      row.status as ShoppingListStatus,
      row.createdById,
      row.completedById,
      row.completedAt,
      row.totalEstimateCents,
      row.currency,
      row.generatedFromSnapshotAt,
      row.note,
      row.createdAt,
      row.updatedAt,
      items,
    );
  }

  toItem(row: PrismaShoppingListItem): ShoppingListItem {
    return new ShoppingListItem(
      row.id,
      row.shoppingListId,
      row.articleId,
      row.warehouseId,
      new Decimal(row.suggestedQty.toString()),
      row.customQty !== null ? new Decimal(row.customQty.toString()) : null,
      row.supplierId,
      row.isChecked,
      row.addedManually,
      row.sortOrder,
      row.estimatedPriceCents,
    );
  }

  toPrismaStatus(s: ShoppingListStatus): PrismaShoppingListStatus {
    return s as PrismaShoppingListStatus;
  }
}
