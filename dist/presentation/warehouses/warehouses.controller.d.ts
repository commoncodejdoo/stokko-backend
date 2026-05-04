import { ArticlesService } from '../../domain/articles/articles.service';
import type { AuthContext } from '../../domain/common/auth-context';
import { OrganizationsService } from '../../domain/organizations/organizations.service';
import { StockService } from '../../domain/stock/stock.service';
import { WarehousesService } from '../../domain/warehouses/warehouses.service';
import { CreateWarehouseDto, UpdateWarehouseDto } from './warehouses.dto';
export declare class WarehousesController {
    private readonly service;
    private readonly articles;
    private readonly stock;
    private readonly orgs;
    constructor(service: WarehousesService, articles: ArticlesService, stock: StockService, orgs: OrganizationsService);
    list(ctx: AuthContext): Promise<{
        items: {
            id: string;
            name: string;
            color: string;
            kind: import("../../domain/warehouses/warehouse.domain").WarehouseKind;
            initials: string;
        }[];
    }>;
    detail(id: string, ctx: AuthContext): Promise<{
        id: string;
        name: string;
        color: string;
        kind: import("../../domain/warehouses/warehouse.domain").WarehouseKind;
        initials: string;
    }>;
    create(body: CreateWarehouseDto, ctx: AuthContext): Promise<{
        id: string;
        name: string;
        color: string;
        kind: import("../../domain/warehouses/warehouse.domain").WarehouseKind;
        initials: string;
    }>;
    update(id: string, body: UpdateWarehouseDto, ctx: AuthContext): Promise<{
        id: string;
        name: string;
        color: string;
        kind: import("../../domain/warehouses/warehouse.domain").WarehouseKind;
        initials: string;
    }>;
    delete(id: string, ctx: AuthContext): Promise<void>;
    listArticles(id: string, ctx: AuthContext): Promise<{
        items: {
            articleId: string;
            sku: string;
            name: string;
            unit: string;
            categoryId: string;
            supplierId: string | null;
            quantity: string;
            status: string;
            purchasePrice: string;
            currency: string;
        }[];
        summary: {
            articleCount: number;
            totalQuantity: string;
            totalValue: string;
            currency: string;
        };
    }>;
    private toPublic;
}
