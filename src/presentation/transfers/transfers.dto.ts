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

class TransferItemDto {
  @IsString()
  @IsNotEmpty()
  articleId!: string;

  @IsNumberString({}, { message: 'quantity must be a numeric string' })
  quantity!: string;
}

export class CreateTransferDto {
  @IsString()
  @IsNotEmpty()
  sourceWarehouseId!: string;

  @IsString()
  @IsNotEmpty()
  destinationWarehouseId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TransferItemDto)
  items!: TransferItemDto[];
}

export class ListTransfersQueryDto {
  @IsOptional() @IsString() warehouseId?: string;
  @IsOptional() @IsNumberString() page?: string;
  @IsOptional() @IsNumberString() pageSize?: string;
}
