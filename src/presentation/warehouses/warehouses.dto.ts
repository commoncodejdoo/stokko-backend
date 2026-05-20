import {
  ArrayUnique,
  IsArray,
  IsEnum,
  IsHexColor,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export enum WarehouseKindDto {
  STORAGE = 'STORAGE',
  FOH = 'FOH',
}

export class CreateWarehouseDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name!: string;

  @IsHexColor()
  color!: string;

  @IsOptional()
  @IsEnum(WarehouseKindDto)
  kind?: WarehouseKindDto;
}

export class UpdateWarehouseDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @IsHexColor()
  color?: string;

  @IsOptional()
  @IsEnum(WarehouseKindDto)
  kind?: WarehouseKindDto;
}

export class ReplaceWarehouseUsersDto {
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  userIds!: string[];
}
