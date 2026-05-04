import { Decimal } from 'decimal.js';
import { TxClient } from '../common/transaction';
import { Unit } from '../common/unit';
import { Article } from './article.domain';
export interface CreateArticleInput {
    organizationId: string;
    sku: string;
    name: string;
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
}
export declare abstract class ArticlesRepository {
    abstract create(input: CreateArticleInput, currency: string, tx?: TxClient): Promise<Article>;
    abstract findById(id: string, currency: string, tx?: TxClient): Promise<Article | null>;
    abstract list(filter: ListArticlesFilter, currency: string, tx?: TxClient): Promise<Article[]>;
    abstract update(id: string, patch: UpdateArticleInput, currency: string, tx?: TxClient): Promise<Article>;
    abstract softDelete(id: string, currency: string, tx?: TxClient): Promise<Article>;
    abstract existsBySku(organizationId: string, sku: string, tx?: TxClient): Promise<boolean>;
}
