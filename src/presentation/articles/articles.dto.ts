import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Unit } from '../../domain/common/unit';

class InitialStockDto {
  @IsString()
  @IsNotEmpty()
  warehouseId!: string;

  @IsNumberString({ no_symbols: false }, { message: 'quantity must be a numeric string' })
  quantity!: string;
}

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  sku!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  // Optional at the DTO level — the service enforces the requirement when
  // `org.priceTrackingEnabled === true`. When the flag is off, missing prices
  // are coerced to "0" so DB NOT NULL constraints still pass.
  @IsOptional()
  @IsNumberString({}, { message: 'purchasePrice must be a numeric string' })
  purchasePrice?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'salePrice must be a numeric string' })
  salePrice?: string;

  @IsEnum(Unit)
  unit!: Unit;

  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @IsOptional()
  @IsString()
  supplierId?: string | null;

  @IsNumberString({}, { message: 'thresholdWarning must be a numeric string' })
  thresholdWarning!: string;

  @IsNumberString({}, { message: 'thresholdCritical must be a numeric string' })
  thresholdCritical!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => InitialStockDto)
  initialStock?: InitialStockDto[];
}

export class UpdateArticleDto {
  @IsOptional() @IsString() @MaxLength(60) sku?: string;
  @IsOptional() @IsString() @MaxLength(120) name?: string;
  @IsOptional() @IsNumberString() purchasePrice?: string;
  @IsOptional() @IsNumberString() salePrice?: string;
  @IsOptional() @IsEnum(Unit) unit?: Unit;
  @IsOptional() @IsString() categoryId?: string;
  @IsOptional() @IsString() supplierId?: string | null;
  @IsOptional() @IsNumberString() thresholdWarning?: string;
  @IsOptional() @IsNumberString() thresholdCritical?: string;
}

export class ListArticlesQueryDto {
  @IsOptional() @IsString() q?: string;
  @IsOptional() @IsString() categoryId?: string;
  @IsOptional() @IsString() supplierId?: string;
  /** "low" — only items with status WARNING or CRITICAL in any warehouse. */
  @IsOptional() @IsString() status?: 'low' | 'all';
  @IsOptional() @IsNumberString() page?: string;
  @IsOptional() @IsNumberString() pageSize?: string;
  // pageSize/page parsed as strings; convert in controller. (Class-validator
  // doesn't have a clean IsInt for query strings without transformer setup.)
  @IsOptional() @Min(0) page_min?: number;
}
