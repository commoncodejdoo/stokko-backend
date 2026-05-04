declare class ProcurementItemDto {
    articleId: string;
    quantity: string;
    purchasePrice: string;
}
export declare class CreateProcurementDto {
    supplierId?: string | null;
    warehouseId: string;
    note?: string;
    items: ProcurementItemDto[];
}
export declare class ListProcurementsQueryDto {
    supplierId?: string;
    warehouseId?: string;
    createdSince?: string;
    page?: string;
    pageSize?: string;
}
export {};
