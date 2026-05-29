import { Decimal } from 'decimal.js';
import { TxClient } from '../common/transaction';
import { Unit } from '../common/unit';
import { Article } from './article.domain';

export interface CreateArticleInput {
  organizationId: string;
  sku: string;
  name: string;
  barcode?: string | null;
  purchasePrice: Decimal;
  salePrice: Decimal;
  unit: Unit;
  categoryId: string;
  supplierId?: string | null;
  thresholdWarning: Decimal;
  thresholdCritical: Decimal;
  createdById: string;
}

export interface UpdateArticleInput {
  sku?: string;
  name?: string;
  barcode?: string | null;
  purchasePrice?: Decimal;
  salePrice?: Decimal;
  unit?: Unit;
  categoryId?: string;
  supplierId?: string | null;
  thresholdWarning?: Decimal;
  thresholdCritical?: Decimal;
}

export interface ListArticlesFilter {
  organizationId: string;
  search?: string;
  categoryId?: string;
  supplierId?: string;
  barcode?: string;
}

export abstract class ArticlesRepository {
  /**
   * `currency` is supplied by the caller (read from the Organization)
   * because `Article` and its `Money` value objects need it but the
   * Article row itself doesn't carry it.
   */
  abstract create(input: CreateArticleInput, currency: string, tx?: TxClient): Promise<Article>;

  abstract findById(id: string, currency: string, tx?: TxClient): Promise<Article | null>;

  abstract list(filter: ListArticlesFilter, currency: string, tx?: TxClient): Promise<Article[]>;

  abstract update(
    id: string,
    patch: UpdateArticleInput,
    currency: string,
    tx?: TxClient,
  ): Promise<Article>;

  abstract softDelete(id: string, currency: string, tx?: TxClient): Promise<Article>;

  /**
   * Convenience SKU collision check used by the service before insert
   * to surface a friendly error rather than a Prisma unique-constraint failure.
   */
  abstract existsBySku(
    organizationId: string,
    sku: string,
    tx?: TxClient,
  ): Promise<boolean>;

  abstract existsByBarcode(
    organizationId: string,
    barcode: string,
    tx?: TxClient,
  ): Promise<boolean>;

  abstract findByBarcode(
    organizationId: string,
    barcode: string,
    currency: string,
    tx?: TxClient,
  ): Promise<Article | null>;
}
