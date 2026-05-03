import { Decimal } from 'decimal.js';
import { ArticlesService } from '../articles/articles.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AuditAction } from '../common/audit-action';
import { OrganizationsService } from '../organizations/organizations.service';
import { ProcurementsService } from '../procurements/procurements.service';
import { StockService } from '../stock/stock.service';
import { UsersService } from '../users/users.service';
import { WarehousesService } from '../warehouses/warehouses.service';
export interface DashboardCounts {
    warehouses: number;
    articles: number;
    lowStockCount: number;
    todayProcurementsCount: number;
}
export interface DashboardWarehouseStat {
    warehouseId: string;
    name: string;
    color: string;
    initials: string;
    articleCount: number;
    totalQuantity: Decimal;
    totalValue: Decimal;
    currency: string;
}
export interface DashboardActivityActor {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    initials: string;
}
export interface DashboardActivityEntry {
    id: string;
    action: AuditAction;
    entityType: string;
    entityId: string;
    user: DashboardActivityActor | null;
    before: unknown;
    after: unknown;
    createdAt: Date;
}
export interface DashboardOverview {
    counts: DashboardCounts;
    perWarehouse: DashboardWarehouseStat[];
    recentActivity: DashboardActivityEntry[];
}
export declare class DashboardService {
    private readonly orgs;
    private readonly warehouses;
    private readonly articles;
    private readonly stock;
    private readonly procurements;
    private readonly auditLog;
    private readonly users;
    constructor(orgs: OrganizationsService, warehouses: WarehousesService, articles: ArticlesService, stock: StockService, procurements: ProcurementsService, auditLog: AuditLogService, users: UsersService);
    getOverview(organizationId: string): Promise<DashboardOverview>;
    private buildRecentActivity;
}
