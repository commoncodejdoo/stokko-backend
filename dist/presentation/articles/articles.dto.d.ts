import { Unit } from '../../domain/common/unit';
declare class InitialStockDto {
    warehouseId: string;
    quantity: string;
}
export declare class CreateArticleDto {
    sku: string;
    name: string;
    purchasePrice: string;
    salePrice: string;
    unit: Unit;
    categoryId: string;
    supplierId?: string | null;
    thresholdWarning: string;
    thresholdCritical: string;
    initialStock?: InitialStockDto[];
}
export declare class UpdateArticleDto {
    sku?: string;
    name?: string;
    purchasePrice?: string;
    salePrice?: string;
    unit?: Unit;
    categoryId?: string;
    supplierId?: string | null;
    thresholdWarning?: string;
    thresholdCritical?: string;
}
export declare class ListArticlesQueryDto {
    q?: string;
    categoryId?: string;
    status?: 'low' | 'all';
    page?: string;
    pageSize?: string;
    page_min?: number;
}
export {};
