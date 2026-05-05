import {
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AdminLoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

export class CreateOrgDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  @IsIn(['EUR', 'USD', 'GBP', 'HRK'])
  currency?: string;

  @IsEmail()
  ownerEmail!: string;

  @IsString()
  @IsNotEmpty()
  ownerFirstName!: string;

  @IsString()
  @IsNotEmpty()
  ownerLastName!: string;
}

export class UpdateOrgDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsIn(['EUR', 'USD', 'GBP', 'HRK'])
  currency?: string;

  @IsOptional()
  isActive?: boolean;
}

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  search?: string;
}
