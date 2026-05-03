declare class ProcurementItemDto {
    articleId: string;
    quantity: string;
    purchasePrice: string;
}
export declare class CreateProcurementDto {
    supplierId: string;
    warehouseId: string;
    note?: string;
    items: ProcurementItemDto[];
}
export declare class ListProcurementsQueryDto {
    supplierId?: string;
    warehouseId?: string;
    page?: string;
    pageSize?: string;
}
export {};
