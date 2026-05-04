import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

class ProcurementItemDto {
  @IsString()
  @IsNotEmpty()
  articleId!: string;

  @IsNumberString({}, { message: 'quantity must be a numeric string' })
  quantity!: string;

  @IsNumberString({}, { message: 'purchasePrice must be a numeric string' })
  purchasePrice!: string;
}

export class CreateProcurementDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  supplierId?: string | null;

  @IsString()
  @IsNotEmpty()
  warehouseId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ProcurementItemDto)
  items!: ProcurementItemDto[];
}

export class ListProcurementsQueryDto {
  @IsOptional() @IsString() supplierId?: string;
  @IsOptional() @IsString() warehouseId?: string;
  /** ISO 8601 timestamp; only procurements with `createdAt >= this` returned. */
  @IsOptional() @IsString() createdSince?: string;
  @IsOptional() @IsNumberString() page?: string;
  @IsOptional() @IsNumberString() pageSize?: string;
}
