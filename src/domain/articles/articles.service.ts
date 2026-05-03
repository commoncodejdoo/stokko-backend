import { Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CategoriesService } from '../categories/categories.service';
import { AuditAction } from '../common/audit-action';
import { AuthContext } from '../common/auth-context';
import {
  CrossOrgAccessError,
  DomainValidationError,
  EntityNotFoundError,
} from '../common/errors';
import { Money } from '../common/money';
import { OrganizationsService } from '../organizations/organizations.service';
import { StockEntry } from '../stock/stock-entry.domain';
import { StockService } from '../stock/stock.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { TxClient } from '../common/transaction';
import { Unit } from '../common/unit';
import { WarehousesService } from '../warehouses/warehouses.service';
import { Article } from './article.domain';
import {
  ArticlesRepository,
  CreateArticleInput,
  ListArticlesFilter,
  UpdateArticleInput,
} from './articles.repository';

export interface CreateArticleCommand {
  sku: string;
  name: string;
  purchasePrice: string | number | Decimal;
  salePrice: string | number | Decimal;
  unit: Unit;
  categoryId: string;
  supplierId?: string | null;
  thresholdWarning: string | number | Decimal;
  thresholdCritical: string | number | Decimal;
  /** Optional seed quantities per warehouse. */
  initialStock?: { warehouseId: string; quantity: string | number | Decimal }[];
}

export interface UpdateArticleCommand {
  sku?: string;
  name?: string;
  purchasePrice?: string | number | Decimal;
  salePrice?: string | number | Decimal;
  unit?: Unit;
  categoryId?: string;
  supplierId?: string | null;
  thresholdWarning?: string | number | Decimal;
  thresholdCritical?: string | number | Decimal;
}

export interface ArticleWithStock {
  article: Article;
  stock: StockEntry[];
}

@Injectable()
export class ArticlesService {
  constructor(
    private readonly repo: ArticlesRepository,
    private readonly orgs: OrganizationsService,
    private readonly categories: CategoriesService,
    private readonly suppliers: SuppliersService,
    private readonly warehouses: WarehousesService,
    private readonly stock: StockService,
    private readonly auditLog: AuditLogService,
  ) {}

  async findById(id: string, organizationId: string, tx?: TxClient): Promise<Article | null> {
    const org = await this.orgs.requireById(organizationId, tx);
    const article = await this.repo.findById(id, org.currency, tx);
    if (!article) return null;
    if (article.organizationId !== organizationId) {
      throw new CrossOrgAccessError('Article', id);
    }
    return article;
  }

  async requireById(id: string, organizationId: string, tx?: TxClient): Promise<Article> {
    const article = await this.findById(id, organizationId, tx);
    if (!article || article.isDeleted()) throw new EntityNotFoundError('Article', id);
    return article;
  }

  async list(
    filter: Omit<ListArticlesFilter, 'organizationId'> & { organizationId: string },
    tx?: TxClient,
  ): Promise<Article[]> {
    const org = await this.orgs.requireById(filter.organizationId, tx);
    return this.repo.list(filter, org.currency, tx);
  }

  async getWithStock(id: string, organizationId: string, tx?: TxClient): Promise<ArticleWithStock> {
    const article = await this.requireById(id, organizationId, tx);
    const stock = await this.stock.getByArticle(article.id, tx);
    return { article, stock };
  }

  async create(
    cmd: CreateArticleCommand,
    ctx: AuthContext,
    tx?: TxClient,
  ): Promise<ArticleWithStock> {
    const org = await this.orgs.requireById(ctx.organizationId, tx);

    // Validate FKs.
    await this.categories.requireById(cmd.categoryId, ctx.organizationId, tx);
    if (cmd.supplierId) {
      await this.suppliers.requireById(cmd.supplierId, ctx.organizationId, tx);
    }

    if (await this.repo.existsBySku(ctx.organizationId, cmd.sku, tx)) {
      throw new DomainValidationError(`SKU "${cmd.sku}" already exists in this organization`, {
        sku: cmd.sku,
      });
    }

    const input: CreateArticleInput = {
      organizationId: ctx.organizationId,
      sku: cmd.sku.trim(),
      name: cmd.name.trim(),
      purchasePrice: new Decimal(cmd.purchasePrice as string | number),
      salePrice: new Decimal(cmd.salePrice as string | number),
      unit: cmd.unit,
      categoryId: cmd.categoryId,
      supplierId: cmd.supplierId ?? null,
      thresholdWarning: new Decimal(cmd.thresholdWarning as string | number),
      thresholdCritical: new Decimal(cmd.thresholdCritical as string | number),
      createdById: ctx.userId,
    };

    const created = await this.repo.create(input, org.currency, tx);

    // Seed initial stock entries if provided.
    const initialStock: StockEntry[] = [];
    if (cmd.initialStock?.length) {
      for (const seed of cmd.initialStock) {
        await this.warehouses.requireById(seed.warehouseId, ctx.organizationId, tx);
        const entry = await this.stock.setQuantity(
          created.id,
          seed.warehouseId,
          new Decimal(seed.quantity as string | number),
          tx,
        );
        initialStock.push(entry);
      }
    }

    await this.auditLog.record(
      {
        organizationId: ctx.organizationId,
        userId: ctx.userId,
        action: AuditAction.ARTICLE_CREATED,
        entityType: 'Article',
        entityId: created.id,
        before: null,
        after: created.toSnapshot(),
      },
      tx,
    );

    return { article: created, stock: initialStock };
  }

  async update(
    id: string,
    cmd: UpdateArticleCommand,
    ctx: AuthContext,
    tx?: TxClient,
  ): Promise<Article> {
    const org = await this.orgs.requireById(ctx.organizationId, tx);
    const before = await this.requireById(id, ctx.organizationId, tx);

    if (cmd.categoryId) {
      await this.categories.requireById(cmd.categoryId, ctx.organizationId, tx);
    }
    if (cmd.supplierId) {
      await this.suppliers.requireById(cmd.supplierId, ctx.organizationId, tx);
    }
    if (cmd.sku && cmd.sku !== before.sku) {
      if (await this.repo.existsBySku(ctx.organizationId, cmd.sku, tx)) {
        throw new DomainValidationError(`SKU "${cmd.sku}" already exists in this organization`, {
          sku: cmd.sku,
        });
      }
    }

    const patch: UpdateArticleInput = {};
    if (cmd.sku !== undefined) patch.sku = cmd.sku.trim();
    if (cmd.name !== undefined) patch.name = cmd.name.trim();
    if (cmd.purchasePrice !== undefined) {
      patch.purchasePrice = new Decimal(cmd.purchasePrice as string | number);
    }
    if (cmd.salePrice !== undefined) {
      patch.salePrice = new Decimal(cmd.salePrice as string | number);
    }
    if (cmd.unit !== undefined) patch.unit = cmd.unit;
    if (cmd.categoryId !== undefined) patch.categoryId = cmd.categoryId;
    if (cmd.supplierId !== undefined) patch.supplierId = cmd.supplierId;
    if (cmd.thresholdWarning !== undefined) {
      patch.thresholdWarning = new Decimal(cmd.thresholdWarning as string | number);
    }
    if (cmd.thresholdCritical !== undefined) {
      patch.thresholdCritical = new Decimal(cmd.thresholdCritical as string | number);
    }

    const updated = await this.repo.update(id, patch, org.currency, tx);

    // Domain re-validation: building a new Article re-runs invariants
    // (e.g. thresholdCritical <= thresholdWarning, currencies match).
    new Article(
      updated.id,
      updated.organizationId,
      updated.sku,
      updated.name,
      updated.purchasePrice,
      updated.salePrice,
      updated.unit,
      updated.categoryId,
      updated.supplierId,
      updated.thresholdWarning,
      updated.thresholdCritical,
      updated.createdById,
      updated.deletedAt,
      updated.createdAt,
      updated.updatedAt,
    );

    await this.auditLog.record(
      {
        organizationId: ctx.organizationId,
        userId: ctx.userId,
        action: AuditAction.ARTICLE_UPDATED,
        entityType: 'Article',
        entityId: updated.id,
        before: before.toSnapshot(),
        after: updated.toSnapshot(),
      },
      tx,
    );
    return updated;
  }

  async softDelete(id: string, ctx: AuthContext, tx?: TxClient): Promise<void> {
    const org = await this.orgs.requireById(ctx.organizationId, tx);
    const before = await this.requireById(id, ctx.organizationId, tx);
    const deleted = await this.repo.softDelete(id, org.currency, tx);
    await this.auditLog.record(
      {
        organizationId: ctx.organizationId,
        userId: ctx.userId,
        action: AuditAction.ARTICLE_DELETED,
        entityType: 'Article',
        entityId: deleted.id,
        before: before.toSnapshot(),
        after: deleted.toSnapshot(),
      },
      tx,
    );
  }

  /** Helper for presentation layer: builds a Money instance for an org's currency. */
  moneyFromDecimal(amount: Decimal, currency: string): Money {
    return new Money(amount, currency);
  }
}
