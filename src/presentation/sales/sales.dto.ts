import { Type } from 'class-transformer';
import {
  ArrayMinSize,
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

export class CloseShiftDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ShiftCloseItemDto)
  items!: ShiftCloseItemDto[];
}

export class ListShiftsQueryDto {
  @IsOptional() @IsNumberString() page?: string;
  @IsOptional() @IsNumberString() pageSize?: string;
}
