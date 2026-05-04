export declare enum WarehouseKindDto {
    STORAGE = "STORAGE",
    FOH = "FOH"
}
export declare class CreateWarehouseDto {
    name: string;
    color: string;
    kind?: WarehouseKindDto;
}
export declare class UpdateWarehouseDto {
    name?: string;
    color?: string;
    kind?: WarehouseKindDto;
}
