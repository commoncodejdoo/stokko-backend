import { ArticlesService } from '../../domain/articles/articles.service';
import { AuditLogService } from '../../domain/audit-log/audit-log.service';
import type { AuthContext } from '../../domain/common/auth-context';
import { StockStatus } from '../../domain/common/stock-status';
import { StockService } from '../../domain/stock/stock.service';
import { UsersService } from '../../domain/users/users.service';
import { CreateArticleDto, ListArticlesQueryDto, UpdateArticleDto } from './articles.dto';
export declare class ArticlesController {
    private readonly service;
    private readonly stock;
    private readonly auditLog;
    private readonly users;
    constructor(service: ArticlesService, stock: StockService, auditLog: AuditLogService, users: UsersService);
    list(q: ListArticlesQueryDto, ctx: AuthContext): Promise<{
        items: {
            id: string;
            sku: string;
            name: string;
            unit: import("../../domain/common/unit").Unit;
            categoryId: string;
            supplierId: string | null;
            purchasePrice: string;
            salePrice: string;
            currency: string;
            thresholdWarning: string;
            thresholdCritical: string;
            totalQuantity: string;
            status: StockStatus;
        }[];
    }>;
    detail(id: string, ctx: AuthContext): Promise<{
        stockByWarehouse: {
            warehouseId: string;
            quantity: string;
            status: StockStatus;
        }[];
        id: string;
        sku: string;
        name: string;
        unit: import("../../domain/common/unit").Unit;
        categoryId: string;
        supplierId: string | null;
        purchasePrice: string;
        salePrice: string;
        currency: string;
        thresholdWarning: string;
        thresholdCritical: string;
        totalQuantity: string;
        status: StockStatus;
    }>;
    create(body: CreateArticleDto, ctx: AuthContext): Promise<{
        stockByWarehouse: {
            warehouseId: string;
            quantity: string;
            status: StockStatus;
        }[];
        id: string;
        sku: string;
        name: string;
        unit: import("../../domain/common/unit").Unit;
        categoryId: string;
        supplierId: string | null;
        purchasePrice: string;
        salePrice: string;
        currency: string;
        thresholdWarning: string;
        thresholdCritical: string;
        totalQuantity: string;
        status: StockStatus;
    }>;
    update(id: string, body: UpdateArticleDto, ctx: AuthContext): Promise<{
        stockByWarehouse: {
            warehouseId: string;
            quantity: string;
            status: StockStatus;
        }[];
        id: string;
        sku: string;
        name: string;
        unit: import("../../domain/common/unit").Unit;
        categoryId: string;
        supplierId: string | null;
        purchasePrice: string;
        salePrice: string;
        currency: string;
        thresholdWarning: string;
        thresholdCritical: string;
        totalQuantity: string;
        status: StockStatus;
    }>;
    delete(id: string, ctx: AuthContext): Promise<void>;
    history(id: string, pageParam: string | undefined, pageSizeParam: string | undefined, ctx: AuthContext): Promise<{
        items: {
            id: string;
            action: import("../../domain/common/audit-action").AuditAction;
            entityType: string;
            entityId: string;
            userId: string;
            user: {
                id: string;
                firstName: string;
                lastName: string;
                fullName: string;
                initials: string;
            } | null;
            before: unknown;
            after: unknown;
            createdAt: string;
        }[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
        };
    }>;
    private overallStatus;
    private toListItem;
    private toDetail;
}
