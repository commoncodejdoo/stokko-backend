import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ShoppingListItem } from '../../domain/shopping-lists/shopping-list-item.domain';
import { ShoppingList } from '../../domain/shopping-lists/shopping-list.domain';
import {
  CreateShoppingListInput,
  CreateShoppingListItemInput,
  ShoppingListsRepository,
  UpdateShoppingListInput,
  UpdateShoppingListItemInput,
} from '../../domain/shopping-lists/shopping-lists.repository';
import { TxClient } from '../../domain/common/transaction';
import { PrismaService } from '../common/prisma/prisma.service';
import { ShoppingListsMapper } from './shopping-lists.mapper';

@Injectable()
export class PrismaShoppingListsRepository extends ShoppingListsRepository {
  private readonly mapper = new ShoppingListsMapper();

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  private client(tx?: TxClient): Prisma.TransactionClient | PrismaService {
    return tx ?? this.prisma;
  }

  async create(
    input: CreateShoppingListInput,
    tx?: TxClient,
  ): Promise<ShoppingList> {
    const row = await this.client(tx).shoppingList.create({
      data: {
        organizationId: input.organizationId,
        createdById: input.createdById,
        status: 'DRAFT',
        currency: input.currency,
        generatedFromSnapshotAt: input.generatedFromSnapshotAt,
        note: input.note ?? null,
        totalEstimateCents: input.totalEstimateCents,
        items: {
          create: input.items.map((it) => this.toPrismaNestedItemCreate(it)),
        },
      },
      include: { items: true },
    });
    return this.mapper.toDomain(row);
  }

  async findById(id: string, tx?: TxClient): Promise<ShoppingList | null> {
    const row = await this.client(tx).shoppingList.findUnique({
      where: { id },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
    });
    return row ? this.mapper.toDomain(row) : null;
  }

  async findActive(
    organizationId: string,
    tx?: TxClient,
  ): Promise<ShoppingList | null> {
    const row = await this.client(tx).shoppingList.findFirst({
      where: {
        organizationId,
        status: { in: ['DRAFT', 'ACTIVE'] },
      },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
    return row ? this.mapper.toDomain(row) : null;
  }

  async listRecent(
    organizationId: string,
    limit: number,
    tx?: TxClient,
  ): Promise<ShoppingList[]> {
    const rows = await this.client(tx).shoppingList.findMany({
      where: { organizationId },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return rows.map((r) => this.mapper.toDomain(r));
  }

  async update(
    id: string,
    patch: UpdateShoppingListInput,
    tx?: TxClient,
  ): Promise<ShoppingList> {
    const data: Prisma.ShoppingListUpdateInput = {};
    if (patch.status !== undefined) data.status = this.mapper.toPrismaStatus(patch.status);
    if (patch.completedById !== undefined) {
      data.completedBy = { connect: { id: patch.completedById } };
    }
    if (patch.completedAt !== undefined) data.completedAt = patch.completedAt;
    if (patch.totalEstimateCents !== undefined) {
      data.totalEstimateCents = patch.totalEstimateCents;
    }
    if (patch.note !== undefined) data.note = patch.note;

    const row = await this.client(tx).shoppingList.update({
      where: { id },
      data,
      include: { items: { orderBy: { sortOrder: 'asc' } } },
    });
    return this.mapper.toDomain(row);
  }

  async addItem(
    listId: string,
    input: CreateShoppingListItemInput,
    tx?: TxClient,
  ): Promise<ShoppingListItem> {
    const row = await this.client(tx).shoppingListItem.create({
      data: {
        shoppingListId: listId,
        articleId: input.articleId,
        warehouseId: input.warehouseId,
        suggestedQty: new Prisma.Decimal(input.suggestedQty.toFixed()),
        customQty:
          input.customQty !== null
            ? new Prisma.Decimal(input.customQty.toFixed())
            : null,
        supplierId: input.supplierId,
        isChecked: input.isChecked,
        addedManually: input.addedManually,
        sortOrder: input.sortOrder,
        estimatedPriceCents: input.estimatedPriceCents,
      },
    });
    return this.mapper.toItem(row);
  }

  async updateItem(
    itemId: string,
    patch: UpdateShoppingListItemInput,
    tx?: TxClient,
  ): Promise<ShoppingListItem> {
    const data: Prisma.ShoppingListItemUpdateInput = {};
    if (patch.customQty !== undefined) {
      data.customQty =
        patch.customQty === null
          ? null
          : new Prisma.Decimal(patch.customQty.toFixed());
    }
    if (patch.supplierId !== undefined) {
      data.supplier = patch.supplierId
        ? { connect: { id: patch.supplierId } }
        : { disconnect: true };
    }
    if (patch.isChecked !== undefined) data.isChecked = patch.isChecked;
    if (patch.estimatedPriceCents !== undefined) {
      data.estimatedPriceCents = patch.estimatedPriceCents;
    }
    const row = await this.client(tx).shoppingListItem.update({
      where: { id: itemId },
      data,
    });
    return this.mapper.toItem(row);
  }

  async removeItem(itemId: string, tx?: TxClient): Promise<void> {
    await this.client(tx).shoppingListItem.delete({ where: { id: itemId } });
  }

  async findItemById(
    itemId: string,
    tx?: TxClient,
  ): Promise<ShoppingListItem | null> {
    const row = await this.client(tx).shoppingListItem.findUnique({
      where: { id: itemId },
    });
    return row ? this.mapper.toItem(row) : null;
  }

  /** Nested create for `ShoppingList.items` — child IDs come from FK, not connect. */
  private toPrismaNestedItemCreate(
    input: CreateShoppingListItemInput,
  ): Prisma.ShoppingListItemCreateWithoutShoppingListInput {
    return {
      article: { connect: { id: input.articleId } },
      warehouse: { connect: { id: input.warehouseId } },
      suggestedQty: new Prisma.Decimal(input.suggestedQty.toFixed()),
      customQty:
        input.customQty !== null
          ? new Prisma.Decimal(input.customQty.toFixed())
          : null,
      supplier: input.supplierId
        ? { connect: { id: input.supplierId } }
        : undefined,
      isChecked: input.isChecked,
      addedManually: input.addedManually,
      sortOrder: input.sortOrder,
      estimatedPriceCents: input.estimatedPriceCents,
    };
  }
}
