import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class ShiftCloseItemDto {
  @IsString()
  @IsNotEmpty()
  articleId!: string;

  @IsString()
  @IsNotEmpty()
  warehouseId!: string;

  @IsNumberString({}, { message: 'quantity must be a numeric string' })
  quantity!: string;
}

class ReplenishOverrideDto {
  @IsString()
  @IsNotEmpty()
  warehouseId!: string;

  @IsString()
  @IsNotEmpty()
  articleId!: string;

  @IsNumberString({}, { message: 'targetQty must be a numeric string' })
  targetQty!: string;
}

class ReplenishDto {
  @IsString()
  @IsNotEmpty()
  sourceWarehouseId!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReplenishOverrideDto)
  overrides?: ReplenishOverrideDto[];

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  skipWarehouseIds?: string[];
}

export class CloseShiftDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ShiftCloseItemDto)
  items!: ShiftCloseItemDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ReplenishDto)
  replenish?: ReplenishDto;
}

export class ListShiftsQueryDto {
  @IsOptional() @IsNumberString() page?: string;
  @IsOptional() @IsNumberString() pageSize?: string;
}
