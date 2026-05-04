import { StockTransfer as PrismaStockTransfer, StockTransferItem as PrismaStockTransferItem } from '@prisma/client';
import { StockTransfer } from '../../domain/transfers/stock-transfer.domain';
type WithItems = PrismaStockTransfer & {
    items: PrismaStockTransferItem[];
};
export declare class TransfersMapper {
    toDomain(t: WithItems): StockTransfer;
}
export {};
