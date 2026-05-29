import { Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { PrismaService } from '../../data/common/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { BarcodeRegistryService } from '../barcode-registry/barcode-registry.service';
import { CategoriesService } from '../categories/categories.service';
import { Category } from '../categories/category.domain';
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
  barcode?: string | null;
  /** Optional when org.priceTrackingEnabled is false; defaults to 0 in that case. */
  purchasePrice?: string | number | Decimal;
  salePrice?: string | number | Decimal;
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
  barcode?: string | null;
  purchasePrice?: string | number | Decimal;
  salePrice?: string | number | Decimal;
  unit?: Unit;
  categoryId?: string;
  supplierId?: string | null;
  thresholdWarning?: string | number | Decimal;
  thresholdCritical?: string | number | Decimal;
}

function isPriceMissing(v: string | number | Decimal | undefined): boolean {
  if (v === undefined || v === null) return true;
  if (typeof v === 'string' && v.trim() === '') return true;
  return false;
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
    private readonly prisma: PrismaService,
    private readonly barcodeRegistry: BarcodeRegistryService,
  ) {}

  private normalizeBarcode(raw: string | null | undefined): string | null {
    if (raw === undefined || raw === null) return null;
    const t = raw.trim();
    return t.length ? t : null;
  }

  async findByBarcode(
    organizationId: string,
    barcode: string,
    tx?: TxClient,
  ): Promise<Article | null> {
    const trimmed = barcode?.trim();
    if (!trimmed) return null;
    const org = await this.orgs.requireById(organizationId, tx);
    return this.repo.findByBarcode(organizationId, trimmed, org.currency, tx);
  }

  /**
   * Run `fn` inside an existing transaction if one was passed, otherwise
   * open a new one. Keeps `create`/`update` atomic without breaking callers
   * that already wrap multi-step work in their own transaction (e.g.
   * bulk-import).
   */
  private async runInTx<T>(
    tx: TxClient | undefined,
    fn: (tx: TxClient) => Promise<T>,
  ): Promise<T> {
    if (tx) return fn(tx);
    return this.prisma.$transaction(fn);
  }

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
    const barcode = this.normalizeBarcode(cmd.barcode);

    return this.runInTx(tx, async (t) => {
      const org = await this.orgs.requireById(ctx.organizationId, t);

      if (org.priceTrackingEnabled) {
        if (isPriceMissing(cmd.purchasePrice) || isPriceMissing(cmd.salePrice)) {
          throw new DomainValidationError(
            'Nabavna i prodajna cijena su obavezne dok je praćenje cijena uključeno',
          );
        }
      }

      // Validate FKs.
      const category = await this.categories.requireById(
        cmd.categoryId,
        ctx.organizationId,
        t,
      );
      if (cmd.supplierId) {
        await this.suppliers.requireById(cmd.supplierId, ctx.organizationId, t);
      }

      if (await this.repo.existsBySku(ctx.organizationId, cmd.sku, t)) {
        throw new DomainValidationError(`SKU "${cmd.sku}" already exists in this organization`, {
          sku: cmd.sku,
        });
      }

      if (barcode && (await this.repo.existsByBarcode(ctx.organizationId, barcode, t))) {
        throw new DomainValidationError(
          `Barcode "${barcode}" already exists in this organization`,
          { barcode },
        );
      }

      const input: CreateArticleInput = {
        organizationId: ctx.organizationId,
        sku: cmd.sku.trim(),
        name: cmd.name.trim(),
        barcode,
        purchasePrice: isPriceMissing(cmd.purchasePrice)
          ? new Decimal(0)
          : new Decimal(cmd.purchasePrice as string | number),
        salePrice: isPriceMissing(cmd.salePrice)
          ? new Decimal(0)
          : new Decimal(cmd.salePrice as string | number),
        unit: cmd.unit,
        categoryId: cmd.categoryId,
        supplierId: cmd.supplierId ?? null,
        thresholdWarning: new Decimal(cmd.thresholdWarning as string | number),
        thresholdCritical: new Decimal(cmd.thresholdCritical as string | number),
        createdById: ctx.userId,
      };

      const created = await this.repo.create(input, org.currency, t);

      // Seed initial stock entries if provided.
      const initialStock: StockEntry[] = [];
      if (cmd.initialStock?.length) {
        for (const seed of cmd.initialStock) {
          await this.warehouses.requireById(seed.warehouseId, ctx.organizationId, t);
          const entry = await this.stock.setQuantity(
            created.id,
            seed.warehouseId,
            new Decimal(seed.quantity as string | number),
            t,
          );
          initialStock.push(entry);
        }
      }

      if (barcode) {
        await this.barcodeRegistry.upsertOnArticleSave(
          {
            barcode,
            suggestedName: created.name,
            suggestedCategoryName: category.name,
            suggestedUnit: created.unit,
            orgId: ctx.organizationId,
          },
          t,
        );
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
        t,
      );

      return { article: created, stock: initialStock };
    });
  }

  async update(
    id: string,
    cmd: UpdateArticleCommand,
    ctx: AuthContext,
    tx?: TxClient,
  ): Promise<Article> {
    return this.runInTx(tx, async (t) => {
      const org = await this.orgs.requireById(ctx.organizationId, t);
      const before = await this.requireById(id, ctx.organizationId, t);

      if (org.priceTrackingEnabled) {
        // When the flag is on, callers may omit prices to leave them unchanged,
        // but explicitly clearing them (empty string) is rejected.
        if (cmd.purchasePrice !== undefined && isPriceMissing(cmd.purchasePrice)) {
          throw new DomainValidationError(
            'Nabavna cijena ne smije biti prazna dok je praćenje cijena uključeno',
          );
        }
        if (cmd.salePrice !== undefined && isPriceMissing(cmd.salePrice)) {
          throw new DomainValidationError(
            'Prodajna cijena ne smije biti prazna dok je praćenje cijena uključeno',
          );
        }
      }

      let category: Category | null = null;
      if (cmd.categoryId) {
        category = await this.categories.requireById(cmd.categoryId, ctx.organizationId, t);
      }
      if (cmd.supplierId) {
        await this.suppliers.requireById(cmd.supplierId, ctx.organizationId, t);
      }
      if (cmd.sku && cmd.sku !== before.sku) {
        if (await this.repo.existsBySku(ctx.organizationId, cmd.sku, t)) {
          throw new DomainValidationError(`SKU "${cmd.sku}" already exists in this organization`, {
            sku: cmd.sku,
          });
        }
      }

      // `barcode` is in the patch only if the caller actually sent the key.
      // Distinguish "not in patch" (leave unchanged) from "null" (clear).
      const barcodeChanging = cmd.barcode !== undefined;
      const nextBarcode = barcodeChanging ? this.normalizeBarcode(cmd.barcode) : before.barcode;
      if (barcodeChanging && nextBarcode && nextBarcode !== before.barcode) {
        if (await this.repo.existsByBarcode(ctx.organizationId, nextBarcode, t)) {
          throw new DomainValidationError(
            `Barcode "${nextBarcode}" already exists in this organization`,
            { barcode: nextBarcode },
          );
        }
      }

      const patch: UpdateArticleInput = {};
      if (cmd.sku !== undefined) patch.sku = cmd.sku.trim();
      if (cmd.name !== undefined) patch.name = cmd.name.trim();
      if (barcodeChanging) patch.barcode = nextBarcode;
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

      const updated = await this.repo.update(id, patch, org.currency, t);

      // Domain re-validation: building a new Article re-runs invariants
      // (e.g. thresholdCritical <= thresholdWarning, currencies match).
      new Article(
        updated.id,
        updated.organizationId,
        updated.sku,
        updated.name,
        updated.barcode,
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

      // Touch the global catalogue whenever the article still carries a barcode.
      // Idempotent — even an unrelated update (e.g. price tweak) refreshes
      // lastSeenAt/usingOrgIds, which doubles as a low-cost activity ping.
      if (updated.barcode) {
        const effectiveCategory =
          category ?? (await this.categories.requireById(updated.categoryId, ctx.organizationId, t));
        await this.barcodeRegistry.upsertOnArticleSave(
          {
            barcode: updated.barcode,
            suggestedName: updated.name,
            suggestedCategoryName: effectiveCategory.name,
            suggestedUnit: updated.unit,
            orgId: ctx.organizationId,
          },
          t,
        );
      }

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
        t,
      );
      return updated;
    });
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
