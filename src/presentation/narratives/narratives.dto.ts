import { IsOptional, IsString, Matches } from 'class-validator';

export class GetDigestQueryDto {
  /** YYYY-MM-DD (UTC). Defaults to today. */
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date?: string;
}

export class ExplainBodyDto {
  @IsString()
  articleId!: string;

  @IsString()
  warehouseId!: string;
}
