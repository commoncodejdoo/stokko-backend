import { Decimal } from 'decimal.js';
import { TxClient } from '../common/transaction';
import { StockTransfer } from './stock-transfer.domain';
export interface CreateTransferItemInput {
    articleId: string;
    quantity: Decimal;
}
export interface CreateTransferInput {
    organizationId: string;
    sourceWarehouseId: string;
    destinationWarehouseId: string;
    createdById: string;
    note?: string | null;
    items: CreateTransferItemInput[];
}
export interface ListTransfersFilter {
    organizationId: string;
    warehouseId?: string;
    page?: number;
    pageSize?: number;
}
export interface PaginatedTransfers {
    items: StockTransfer[];
    total: number;
}
export declare abstract class TransfersRepository {
    abstract create(input: CreateTransferInput, tx?: TxClient): Promise<StockTransfer>;
    abstract findById(id: string, tx?: TxClient): Promise<StockTransfer | null>;
    abstract list(filter: ListTransfersFilter, tx?: TxClient): Promise<PaginatedTransfers>;
}
