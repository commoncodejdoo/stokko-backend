export declare enum ReportPeriodDto {
    DAY = "day",
    WEEK = "week",
    MONTH = "month",
    YEAR = "year"
}
export declare class SalesReportQueryDto {
    period: ReportPeriodDto;
    offset?: string;
}
