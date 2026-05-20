import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumberString,
  IsString,
  ValidateNested,
} from 'class-validator';

export class StockTargetItemDto {
  @IsString()
  @IsNotEmpty()
  articleId!: string;

  @IsNumberString()
  targetQty!: string;
}

export class ReplaceStockTargetsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockTargetItemDto)
  items!: StockTargetItemDto[];
}
