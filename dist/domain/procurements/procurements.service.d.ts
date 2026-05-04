import { Decimal } from 'decimal.js';
import { ArticlesService } from '../articles/articles.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AuthContext } from '../common/auth-context';
import { TxClient } from '../common/transaction';
import { OrganizationsService } from '../organizations/organizations.service';
import { StockService } from '../stock/stock.service';
import { SuppliersService } from '../suppliers/suppliers.service';
import { WarehousesService } from '../warehouses/warehouses.service';
import { PrismaService } from '../../data/common/prisma/prisma.service';
import { Procurement } from './procurement.domain';
import { ListProcurementsFilter, PaginatedProcurements, ProcurementsRepository } from './procurements.repository';
export interface CreateProcurementItemCommand {
    articleId: string;
    quantity: string | number | Decimal;
    purchasePrice: string | number | Decimal;
}
export interface CreateProcurementCommand {
    supplierId?: string | null;
    warehouseId: string;
    note?: string;
    items: CreateProcurementItemCommand[];
}
export declare class ProcurementsService {
    private readonly repo;
    private readonly orgs;
    private readonly suppliers;
    private readonly warehouses;
    private readonly articles;
    private readonly stock;
    private readonly auditLog;
    private readonly prisma;
    constructor(repo: ProcurementsRepository, orgs: OrganizationsService, suppliers: SuppliersService, warehouses: WarehousesService, articles: ArticlesService, stock: StockService, auditLog: AuditLogService, prisma: PrismaService);
    create(cmd: CreateProcurementCommand, ctx: AuthContext): Promise<Procurement>;
    findById(id: string, organizationId: string, tx?: TxClient): Promise<Procurement>;
    list(filter: Omit<ListProcurementsFilter, 'organizationId'> & {
        organizationId: string;
    }, tx?: TxClient): Promise<PaginatedProcurements>;
    countCreatedSince(organizationId: string, since: Date, tx?: TxClient): Promise<number>;
}
