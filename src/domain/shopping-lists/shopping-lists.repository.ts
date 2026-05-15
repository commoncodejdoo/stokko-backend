import { Decimal } from 'decimal.js';
import { TxClient } from '../common/transaction';
import { ShoppingListItem } from './shopping-list-item.domain';
import { ShoppingList, ShoppingListStatus } from './shopping-list.domain';

export interface CreateShoppingListInput {
  organizationId: string;
  createdById: string;
  currency: string;
  generatedFromSnapshotAt: Date | null;
  note?: string | null;
  totalEstimateCents: number;
  items: CreateShoppingListItemInput[];
}

export interface CreateShoppingListItemInput {
  articleId: string;
  warehouseId: string;
  suggestedQty: Decimal;
  customQty: Decimal | null;
  supplierId: string | null;
  isChecked: boolean;
  addedManually: boolean;
  sortOrder: number;
  estimatedPriceCents: number;
}

export interface UpdateShoppingListInput {
  status?: ShoppingListStatus;
  completedById?: string;
  completedAt?: Date;
  totalEstimateCents?: number;
  note?: string | null;
}

export interface UpdateShoppingListItemInput {
  customQty?: Decimal | null;
  supplierId?: string | null;
  isChecked?: boolean;
  estimatedPriceCents?: number;
}

export abstract class ShoppingListsRepository {
  abstract create(
    input: CreateShoppingListInput,
    tx?: TxClient,
  ): Promise<ShoppingList>;
  abstract findById(id: string, tx?: TxClient): Promise<ShoppingList | null>;
  abstract findActive(organizationId: string, tx?: TxClient): Promise<ShoppingList | null>;
  abstract listRecent(
    organizationId: string,
    limit: number,
    tx?: TxClient,
  ): Promise<ShoppingList[]>;
  abstract update(
    id: string,
    patch: UpdateShoppingListInput,
    tx?: TxClient,
  ): Promise<ShoppingList>;
  abstract addItem(
    listId: string,
    input: CreateShoppingListItemInput,
    tx?: TxClient,
  ): Promise<ShoppingListItem>;
  abstract updateItem(
    itemId: string,
    patch: UpdateShoppingListItemInput,
    tx?: TxClient,
  ): Promise<ShoppingListItem>;
  abstract removeItem(itemId: string, tx?: TxClient): Promise<void>;
  abstract findItemById(itemId: string, tx?: TxClient): Promise<ShoppingListItem | null>;
}
