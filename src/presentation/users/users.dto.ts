import {
  ArrayUnique,
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Role } from '../../domain/common/role';

export class InviteUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  lastName!: string;

  @IsEnum(Role)
  role!: Role;
}

export class UpdateUserDto {
  @IsOptional() @IsString() @MaxLength(60) firstName?: string;
  @IsOptional() @IsString() @MaxLength(60) lastName?: string;
  @IsOptional() @IsEnum(Role) role?: Role;
}

export class ReplaceUserWarehousesDto {
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  warehouseIds!: string[];
}
