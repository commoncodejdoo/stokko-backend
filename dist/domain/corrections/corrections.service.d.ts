import { Decimal } from 'decimal.js';
import { ArticlesService } from '../articles/articles.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AuthContext } from '../common/auth-context';
import { TxClient } from '../common/transaction';
import { OrganizationsService } from '../organizations/organizations.service';
import { StockService } from '../stock/stock.service';
import { WarehousesService } from '../warehouses/warehouses.service';
import { PrismaService } from '../../data/common/prisma/prisma.service';
import { CorrectionReason, CorrectionType, StockCorrection } from './correction.domain';
import { CorrectionsRepository, ListCorrectionsFilter, PaginatedCorrections } from './corrections.repository';
export interface CreateCorrectionCommand {
    articleId: string;
    warehouseId: string;
    type: CorrectionType;
    value: string | number | Decimal;
    reason: CorrectionReason;
    note?: string;
}
export declare class CorrectionsService {
    private readonly repo;
    private readonly orgs;
    private readonly articles;
    private readonly warehouses;
    private readonly stock;
    private readonly auditLog;
    private readonly prisma;
    constructor(repo: CorrectionsRepository, orgs: OrganizationsService, articles: ArticlesService, warehouses: WarehousesService, stock: StockService, auditLog: AuditLogService, prisma: PrismaService);
    create(cmd: CreateCorrectionCommand, ctx: AuthContext): Promise<StockCorrection>;
    findById(id: string, organizationId: string, tx?: TxClient): Promise<StockCorrection>;
    list(filter: Omit<ListCorrectionsFilter, 'organizationId'> & {
        organizationId: string;
    }, tx?: TxClient): Promise<PaginatedCorrections>;
}
