import type { AuthContext } from '../../domain/common/auth-context';
import { SalesReportService } from '../../domain/sales/sales-report.service';
import { SalesReportQueryDto } from './sales-report.dto';
export declare class SalesReportController {
    private readonly service;
    constructor(service: SalesReportService);
    report(q: SalesReportQueryDto, ctx: AuthContext): Promise<{
        period: {
            kind: import("../../domain/sales/sales-report.service").ReportPeriod;
            offset: number;
            from: string;
            to: string;
            label: string;
        };
        totals: import("../../domain/sales/sales-report.service").ReportTotals;
        byDate: import("../../domain/sales/sales-report.service").ReportByDateBucket[];
        byArticle: import("../../domain/sales/sales-report.service").ReportByArticleBucket[];
        shifts: import("../../domain/sales/sales-report.service").ReportShiftEntry[];
    }>;
    private toPublic;
}
