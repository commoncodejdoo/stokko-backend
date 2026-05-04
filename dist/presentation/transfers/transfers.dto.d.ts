declare class TransferItemDto {
    articleId: string;
    quantity: string;
}
export declare class CreateTransferDto {
    sourceWarehouseId: string;
    destinationWarehouseId: string;
    note?: string;
    items: TransferItemDto[];
}
export declare class ListTransfersQueryDto {
    warehouseId?: string;
    page?: string;
    pageSize?: string;
}
export {};
