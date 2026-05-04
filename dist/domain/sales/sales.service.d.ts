import { Decimal } from 'decimal.js';
import { ArticlesService } from '../articles/articles.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AuthContext } from '../common/auth-context';
import { TxClient } from '../common/transaction';
import { OrganizationsService } from '../organizations/organizations.service';
import { StockService } from '../stock/stock.service';
import { WarehousesService } from '../warehouses/warehouses.service';
import { PrismaService } from '../../data/common/prisma/prisma.service';
import { ListShiftsFilter, PaginatedShifts, SalesRepository, ShiftWithSales } from './sales.repository';
export interface CloseShiftItemCommand {
    articleId: string;
    warehouseId: string;
    quantity: string | number | Decimal;
}
export interface CloseShiftCommand {
    items: CloseShiftItemCommand[];
}
export declare class SalesService {
    private readonly repo;
    private readonly orgs;
    private readonly warehouses;
    private readonly articles;
    private readonly stock;
    private readonly auditLog;
    private readonly prisma;
    constructor(repo: SalesRepository, orgs: OrganizationsService, warehouses: WarehousesService, articles: ArticlesService, stock: StockService, auditLog: AuditLogService, prisma: PrismaService);
    closeShift(cmd: CloseShiftCommand, ctx: AuthContext): Promise<ShiftWithSales>;
    findShiftById(id: string, organizationId: string, tx?: TxClient): Promise<ShiftWithSales>;
    listShifts(filter: Omit<ListShiftsFilter, 'organizationId'> & {
        organizationId: string;
    }, tx?: TxClient): Promise<PaginatedShifts>;
    deleteShift(id: string, organizationId: string, ctx: AuthContext, tx?: TxClient): Promise<void>;
}
