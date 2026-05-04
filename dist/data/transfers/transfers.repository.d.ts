import { TxClient } from '../../domain/common/transaction';
import { StockTransfer } from '../../domain/transfers/stock-transfer.domain';
import { CreateTransferInput, ListTransfersFilter, PaginatedTransfers, TransfersRepository } from '../../domain/transfers/transfers.repository';
import { PrismaService } from '../common/prisma/prisma.service';
export declare class PrismaTransfersRepository extends TransfersRepository {
    private readonly prisma;
    private readonly mapper;
    constructor(prisma: PrismaService);
    private client;
    create(input: CreateTransferInput, tx?: TxClient): Promise<StockTransfer>;
    findById(id: string, tx?: TxClient): Promise<StockTransfer | null>;
    list(filter: ListTransfersFilter, tx?: TxClient): Promise<PaginatedTransfers>;
}
