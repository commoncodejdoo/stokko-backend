import { Decimal } from 'decimal.js';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CategoriesService } from '../categories/categories.service';
import { AuthContext } from '../common/auth-context';
import { Money } from '../common/money';
import { OrganizationsService } from '../organizations/organizations.service';
import { StockEntry } from '../stock/stock-entry.domain';
import { StockService } from '../stock/stock.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { TxClient } from '../common/transaction';
import { Unit } from '../common/unit';
import { WarehousesService } from '../warehouses/warehouses.service';
import { Article } from './article.domain';
import { ArticlesRepository, ListArticlesFilter } from './articles.repository';
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
    initialStock?: {
        warehouseId: string;
        quantity: string | number | Decimal;
    }[];
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
export declare class ArticlesService {
    private readonly repo;
    private readonly orgs;
    private readonly categories;
    private readonly suppliers;
    private readonly warehouses;
    private readonly stock;
    private readonly auditLog;
    constructor(repo: ArticlesRepository, orgs: OrganizationsService, categories: CategoriesService, suppliers: SuppliersService, warehouses: WarehousesService, stock: StockService, auditLog: AuditLogService);
    findById(id: string, organizationId: string, tx?: TxClient): Promise<Article | null>;
    requireById(id: string, organizationId: string, tx?: TxClient): Promise<Article>;
    list(filter: Omit<ListArticlesFilter, 'organizationId'> & {
        organizationId: string;
    }, tx?: TxClient): Promise<Article[]>;
    getWithStock(id: string, organizationId: string, tx?: TxClient): Promise<ArticleWithStock>;
    create(cmd: CreateArticleCommand, ctx: AuthContext, tx?: TxClient): Promise<ArticleWithStock>;
    update(id: string, cmd: UpdateArticleCommand, ctx: AuthContext, tx?: TxClient): Promise<Article>;
    softDelete(id: string, ctx: AuthContext, tx?: TxClient): Promise<void>;
    moneyFromDecimal(amount: Decimal, currency: string): Money;
}
