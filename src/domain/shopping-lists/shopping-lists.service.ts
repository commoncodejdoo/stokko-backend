import { Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { ArticlesService } from '../articles/articles.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AuditAction } from '../common/audit-action';
import { AuthContext } from '../common/auth-context';
import {
  CrossOrgAccessError,
  DomainValidationError,
  EntityNotFoundError,
} from '../common/errors';
import { TxClient } from '../common/transaction';
import { OrganizationsService } from '../organizations/organizations.service';
import { PredictionsService } from '../predictions/predictions.service';
import { ProcurementsService } from '../procurements/procurements.service';
import { WarehousesService } from '../warehouses/warehouses.service';
import { PrismaService } from '../../data/common/prisma/prisma.service';
import { ShoppingListItem } from './shopping-list-item.domain';
import { ShoppingList } from './shopping-list.domain';
import {
  ActiveShoppingListAlreadyExistsError,
  ShoppingListNotActiveError,
} from './shopping-lists.errors';
import {
  CreateShoppingListItemInput,
  ShoppingListsRepository,
  UpdateShoppingListItemInput,
} from './shopping-lists.repository';

export interface AddItemCommand {
  articleId: string;
  warehouseId: string;
  customQty?: string | number;
  supplierId?: string | null;
}

export interface UpdateItemCommand {
  customQty?: string | number | null;
  supplierId?: string | null;
  isChecked?: boolean;
}

export interface CompleteResult {
  list: ShoppingList;
  procurementIds: string[];
}

@Injectable()
export class ShoppingListsService {
  constructor(
    private readonly repo: ShoppingListsRepository,
    private readonly orgs: OrganizationsService,
    private readonly articles: ArticlesService,
    private readonly warehouses: WarehousesService,
    private readonly predictions: PredictionsService,
    private readonly procurements: ProcurementsService,
    private readonly auditLog: AuditLogService,
    private readonly prisma: PrismaService,
  ) {}

  async getActive(organizationId: string, tx?: TxClient): Promise<ShoppingList | null> {
    await this.orgs.requireById(organizationId, tx);
    return this.repo.findActive(organizationId, tx);
  }

  async findById(id: string, organizationId: string, tx?: TxClient): Promise<ShoppingList> {
    await this.orgs.requireById(organizationId, tx);
    const list = await this.repo.findById(id, tx);
    if (!list) throw new EntityNotFoundError('ShoppingList', id);
    if (list.organizationId !== organizationId) {
      throw new CrossOrgAccessError('ShoppingList', id);
    }
    return list;
  }

  /**
   * Create a new ShoppingList from the latest predictions snapshot.
   * Pulls every snapshot where shouldReorder=true and seeds an item with
   * suggestedQty. Total estimate computed from Article.purchasePrice.
   */
  async createFromCurrentSnapshot(ctx: AuthContext): Promise<ShoppingList> {
    return this.prisma.$transaction(async (tx) => {
      const org = await this.orgs.requireById(ctx.organizationId, tx);

      const existing = await this.repo.findActive(ctx.organizationId, tx);
      if (existing) {
        throw new ActiveShoppingListAlreadyExistsError(existing.id);
      }

      const snapshots = await this.predictions.listLatest(
        { organizationId: ctx.organizationId, shouldReorderOnly: true },
        tx,
      );

      // Seed items: one per snapshot.
      const items: CreateShoppingListItemInput[] = [];
      let totalCents = 0;
      let sortOrder = 0;
      let generatedFromSnapshotAt: Date | null = null;

      for (const s of snapshots) {
        const article = await this.articles.requireById(
          s.articleId,
          ctx.organizationId,
          tx,
        );
        const qty = s.suggestedQty;
        const purchaseCents = Math.round(
          Number(article.purchasePrice.amount.toFixed(2)) * 100,
        );
        const itemCents = Math.round(
          Number(qty.times(purchaseCents).toFixed(0)),
        );
        totalCents += itemCents;
        items.push({
          articleId: s.articleId,
          warehouseId: s.warehouseId,
          suggestedQty: qty,
          customQty: null,
          supplierId: article.supplierId,
          isChecked: true, // pre-checked since they come from "shouldReorder"
          addedManually: false,
          sortOrder: sortOrder++,
          estimatedPriceCents: itemCents,
        });
        if (!generatedFromSnapshotAt || s.computedAt > generatedFromSnapshotAt) {
          generatedFromSnapshotAt = s.computedAt;
        }
      }

      const list = await this.repo.create(
        {
          organizationId: ctx.organizationId,
          createdById: ctx.userId,
          currency: org.currency,
          generatedFromSnapshotAt,
          totalEstimateCents: totalCents,
          items,
        },
        tx,
      );

      await this.auditLog.record(
        {
          organizationId: ctx.organizationId,
          userId: ctx.userId,
          action: AuditAction.SHOPPING_LIST_CREATED,
          entityType: 'ShoppingList',
          entityId: list.id,
          before: null,
          after: list.toSnapshot(),
        },
        tx,
      );

      return list;
    });
  }

  async addItem(
    listId: string,
    cmd: AddItemCommand,
    ctx: AuthContext,
  ): Promise<ShoppingListItem> {
    return this.prisma.$transaction(async (tx) => {
      const list = await this.findById(listId, ctx.organizationId, tx);
      if (!list.isActive()) throw new ShoppingListNotActiveError(list.status);

      const article = await this.articles.requireById(
        cmd.articleId,
        ctx.organizationId,
        tx,
      );
      await this.warehouses.requireById(cmd.warehouseId, ctx.organizationId, tx);

      const customQty =
        cmd.customQty !== undefined ? new Decimal(cmd.customQty) : null;
      const effectiveQty = customQty ?? new Decimal(0);
      const purchaseCents = Math.round(
        Number(article.purchasePrice.amount.toFixed(2)) * 100,
      );
      const itemCents = effectiveQty.times(purchaseCents).toNumber();

      const item = await this.repo.addItem(
        listId,
        {
          articleId: cmd.articleId,
          warehouseId: cmd.warehouseId,
          suggestedQty: new Decimal(0),
          customQty,
          supplierId: cmd.supplierId ?? article.supplierId,
          isChecked: false,
          addedManually: true,
          sortOrder: list.items.length,
          estimatedPriceCents: Math.round(itemCents),
        },
        tx,
      );

      await this.recalcTotal(listId, tx);

      await this.auditLog.record(
        {
          organizationId: ctx.organizationId,
          userId: ctx.userId,
          action: AuditAction.SHOPPING_LIST_ITEM_ADDED,
          entityType: 'ShoppingListItem',
          entityId: item.id,
          before: null,
          after: item.toSnapshot(),
        },
        tx,
      );
      return item;
    });
  }

  async updateItem(
    listId: string,
    itemId: string,
    cmd: UpdateItemCommand,
    ctx: AuthContext,
  ): Promise<ShoppingListItem> {
    return this.prisma.$transaction(async (tx) => {
      const list = await this.findById(listId, ctx.organizationId, tx);
      if (!list.isActive()) throw new ShoppingListNotActiveError(list.status);

      const before = await this.repo.findItemById(itemId, tx);
      if (!before || before.shoppingListId !== listId) {
        throw new EntityNotFoundError('ShoppingListItem', itemId);
      }

      const patch: UpdateShoppingListItemInput = {};
      if (cmd.customQty !== undefined) {
        patch.customQty =
          cmd.customQty === null ? null : new Decimal(cmd.customQty);
      }
      if (cmd.supplierId !== undefined) patch.supplierId = cmd.supplierId;
      if (cmd.isChecked !== undefined) patch.isChecked = cmd.isChecked;

      // Recompute estimated price if qty changed.
      if (patch.customQty !== undefined) {
        const article = await this.articles.requireById(
          before.articleId,
          ctx.organizationId,
          tx,
        );
        const effective = patch.customQty ?? before.suggestedQty;
        const purchaseCents = Math.round(
          Number(article.purchasePrice.amount.toFixed(2)) * 100,
        );
        patch.estimatedPriceCents = Math.round(
          effective.times(purchaseCents).toNumber(),
        );
      }

      const updated = await this.repo.updateItem(itemId, patch, tx);
      await this.recalcTotal(listId, tx);

      await this.auditLog.record(
        {
          organizationId: ctx.organizationId,
          userId: ctx.userId,
          action: AuditAction.SHOPPING_LIST_ITEM_UPDATED,
          entityType: 'ShoppingListItem',
          entityId: itemId,
          before: before.toSnapshot(),
          after: updated.toSnapshot(),
        },
        tx,
      );
      return updated;
    });
  }

  async removeItem(
    listId: string,
    itemId: string,
    ctx: AuthContext,
  ): Promise<void> {
    return this.prisma.$transaction(async (tx) => {
      const list = await this.findById(listId, ctx.organizationId, tx);
      if (!list.isActive()) throw new ShoppingListNotActiveError(list.status);

      const before = await this.repo.findItemById(itemId, tx);
      if (!before || before.shoppingListId !== listId) {
        throw new EntityNotFoundError('ShoppingListItem', itemId);
      }

      await this.repo.removeItem(itemId, tx);
      await this.recalcTotal(listId, tx);

      await this.auditLog.record(
        {
          organizationId: ctx.organizationId,
          userId: ctx.userId,
          action: AuditAction.SHOPPING_LIST_ITEM_REMOVED,
          entityType: 'ShoppingListItem',
          entityId: itemId,
          before: before.toSnapshot(),
          after: null,
        },
        tx,
      );
    });
  }

  /**
   * Complete the list — convert isChecked items into Procurement(s),
   * grouped by (supplierId, warehouseId). Sets status=COMPLETED.
   */
  async complete(listId: string, ctx: AuthContext): Promise<CompleteResult> {
    return this.prisma.$transaction(async (tx) => {
      const list = await this.findById(listId, ctx.organizationId, tx);
      if (!list.isActive()) throw new ShoppingListNotActiveError(list.status);

      const checkedItems = list.items.filter((it) => it.isChecked);
      if (checkedItems.length === 0) {
        throw new DomainValidationError(
          'Nije moguće dovršiti listu bez ijedne čekirane stavke',
          { listId },
        );
      }

      // Group by (supplierId, warehouseId) — one Procurement per pair.
      type GroupKey = string;
      const groups = new Map<GroupKey, typeof checkedItems>();
      for (const it of checkedItems) {
        const key = `${it.supplierId ?? '__nil__'}|${it.warehouseId}`;
        const bucket = groups.get(key) ?? [];
        bucket.push(it);
        groups.set(key, bucket);
      }

      const procurementIds: string[] = [];
      for (const bucket of groups.values()) {
        const sample = bucket[0];
        const items = await Promise.all(
          bucket.map(async (it) => {
            const article = await this.articles.requireById(
              it.articleId,
              ctx.organizationId,
              tx,
            );
            return {
              articleId: it.articleId,
              quantity: it.effectiveQty(),
              purchasePrice: article.purchasePrice.amount,
            };
          }),
        );
        // ProcurementsService.create starts its own $transaction — but we are
        // already inside one. The implementation uses $transaction at top
        // level, which is a no-op when nested in Prisma 6. We rely on the
        // service's invariants while keeping audit + state in one tx.
        const proc = await this.procurements.create(
          {
            supplierId: sample.supplierId,
            warehouseId: sample.warehouseId,
            note: `Iz liste za kupovinu ${listId.slice(0, 8)}`,
            items,
          },
          ctx,
        );
        procurementIds.push(proc.id);
      }

      const updated = await this.repo.update(
        listId,
        {
          status: 'COMPLETED',
          completedById: ctx.userId,
          completedAt: new Date(),
        },
        tx,
      );

      await this.auditLog.record(
        {
          organizationId: ctx.organizationId,
          userId: ctx.userId,
          action: AuditAction.SHOPPING_LIST_COMPLETED,
          entityType: 'ShoppingList',
          entityId: listId,
          before: list.toSnapshot(),
          after: { ...updated.toSnapshot(), procurementIds },
        },
        tx,
      );

      return { list: updated, procurementIds };
    });
  }

  async cancel(listId: string, ctx: AuthContext): Promise<ShoppingList> {
    return this.prisma.$transaction(async (tx) => {
      const list = await this.findById(listId, ctx.organizationId, tx);
      if (!list.isActive()) throw new ShoppingListNotActiveError(list.status);

      const updated = await this.repo.update(
        listId,
        { status: 'CANCELLED' },
        tx,
      );

      await this.auditLog.record(
        {
          organizationId: ctx.organizationId,
          userId: ctx.userId,
          action: AuditAction.SHOPPING_LIST_CANCELLED,
          entityType: 'ShoppingList',
          entityId: listId,
          before: list.toSnapshot(),
          after: updated.toSnapshot(),
        },
        tx,
      );
      return updated;
    });
  }

  // ─── helpers ───

  private async recalcTotal(listId: string, tx: TxClient): Promise<void> {
    const list = await this.repo.findById(listId, tx);
    if (!list) return;
    const total = list.items.reduce((acc, it) => acc + it.estimatedPriceCents, 0);
    await this.repo.update(listId, { totalEstimateCents: total }, tx);
  }
}
