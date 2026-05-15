import { IsBooleanString, IsIn, IsOptional, IsString } from 'class-validator';

export class ListPredictionsQueryDto {
  @IsOptional()
  @IsString()
  warehouseId?: string;

  @IsOptional()
  @IsIn(['CRITICAL', 'WARNING', 'OK'])
  urgency?: 'CRITICAL' | 'WARNING' | 'OK';

  @IsOptional()
  @IsBooleanString()
  shouldReorderOnly?: string;
}
