import { Decimal } from 'decimal.js';
import { ArticlesService } from '../articles/articles.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AuthContext } from '../common/auth-context';
import { TxClient } from '../common/transaction';
import { StockService } from '../stock/stock.service';
import { WarehousesService } from '../warehouses/warehouses.service';
import { PrismaService } from '../../data/common/prisma/prisma.service';
import { StockTransfer } from './stock-transfer.domain';
import { ListTransfersFilter, PaginatedTransfers, TransfersRepository } from './transfers.repository';
export interface CreateTransferItemCommand {
    articleId: string;
    quantity: string | number | Decimal;
}
export interface CreateTransferCommand {
    sourceWarehouseId: string;
    destinationWarehouseId: string;
    note?: string;
    items: CreateTransferItemCommand[];
}
export declare class TransfersService {
    private readonly repo;
    private readonly warehouses;
    private readonly articles;
    private readonly stock;
    private readonly auditLog;
    private readonly prisma;
    constructor(repo: TransfersRepository, warehouses: WarehousesService, articles: ArticlesService, stock: StockService, auditLog: AuditLogService, prisma: PrismaService);
    create(cmd: CreateTransferCommand, ctx: AuthContext): Promise<StockTransfer>;
    findById(id: string, organizationId: string, tx?: TxClient): Promise<StockTransfer>;
    list(filter: Omit<ListTransfersFilter, 'organizationId'> & {
        organizationId: string;
    }, tx?: TxClient): Promise<PaginatedTransfers>;
}
