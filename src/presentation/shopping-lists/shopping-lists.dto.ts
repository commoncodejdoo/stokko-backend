import {
  IsBoolean,
  IsNumberString,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class AddShoppingListItemDto {
  @IsString()
  articleId!: string;

  @IsString()
  warehouseId!: string;

  @IsOptional()
  @IsNumberString()
  customQty?: string;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  supplierId?: string | null;
}

export class UpdateShoppingListItemDto {
  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsNumberString()
  customQty?: string | null;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  supplierId?: string | null;

  @IsOptional()
  @IsBoolean()
  isChecked?: boolean;
}
