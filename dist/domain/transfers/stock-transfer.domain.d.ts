import { StockTransferItem } from './stock-transfer-item.domain';
export declare class StockTransfer {
    readonly id: string;
    readonly organizationId: string;
    readonly sourceWarehouseId: string;
    readonly destinationWarehouseId: string;
    readonly createdById: string;
    readonly note: string | null;
    readonly createdAt: Date;
    readonly items: StockTransferItem[];
    constructor(id: string, organizationId: string, sourceWarehouseId: string, destinationWarehouseId: string, createdById: string, note: string | null, createdAt: Date, items: StockTransferItem[]);
    toSnapshot(): Record<string, unknown>;
}
