import { ArticlesService } from '../articles/articles.service';
import { TxClient } from '../common/transaction';
import { OrganizationsService } from '../organizations/organizations.service';
import { PrismaService } from '../../data/common/prisma/prisma.service';
export type ReportPeriod = 'day' | 'week' | 'month' | 'year';
export interface ReportRange {
    from: Date;
    to: Date;
    label: string;
}
export interface ReportTotals {
    qty: string;
    revenue: string;
    currency: string;
}
export interface ReportByDateBucket {
    date: string;
    qty: string;
    revenue: string;
}
export interface ReportByArticleBucket {
    articleId: string;
    name: string;
    qty: string;
    revenue: string;
}
export interface ReportShiftEntry {
    id: string;
    date: string;
    status: 'OPEN' | 'CLOSED';
    closedAt: string | null;
    closedBy: {
        id: string;
        firstName: string;
        lastName: string;
        initials: string;
    } | null;
    totalQuantity: string;
    totalRevenue: string;
}
export interface SalesReport {
    period: ReportRange & {
        kind: ReportPeriod;
        offset: number;
    };
    totals: ReportTotals;
    byDate: ReportByDateBucket[];
    byArticle: ReportByArticleBucket[];
    shifts: ReportShiftEntry[];
}
export declare class SalesReportService {
    private readonly orgs;
    private readonly articles;
    private readonly prisma;
    constructor(orgs: OrganizationsService, articles: ArticlesService, prisma: PrismaService);
    getReport(organizationId: string, period: ReportPeriod, offset: number, tx?: TxClient): Promise<SalesReport>;
}
