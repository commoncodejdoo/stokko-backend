import { IsEnum, IsNumberString, IsOptional } from 'class-validator';

export enum ReportPeriodDto {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export class SalesReportQueryDto {
  @IsEnum(ReportPeriodDto)
  period!: ReportPeriodDto;

  @IsOptional()
  @IsNumberString({ no_symbols: false })
  offset?: string;
}
