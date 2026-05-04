declare class ShiftCloseItemDto {
    articleId: string;
    warehouseId: string;
    quantity: string;
}
export declare class CloseShiftDto {
    items: ShiftCloseItemDto[];
}
export declare class ListShiftsQueryDto {
    page?: string;
    pageSize?: string;
}
export {};
