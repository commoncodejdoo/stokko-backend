import {
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  CorrectionReason,
  CorrectionType,
} from '../../domain/corrections/correction.domain';

export class CreateCorrectionDto {
  @IsString()
  @IsNotEmpty()
  articleId!: string;

  @IsString()
  @IsNotEmpty()
  warehouseId!: string;

  @IsEnum(CorrectionType)
  type!: CorrectionType;

  /**
   * Decimal numeric string. For ABSOLUTE must be >= 0; for DELTA may be
   * negative. The leading '-' is allowed by IsNumberString.
   */
  @IsNumberString({}, { message: 'value must be a numeric string' })
  value!: string;

  @IsEnum(CorrectionReason)
  reason!: CorrectionReason;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class ListCorrectionsQueryDto {
  @IsOptional() @IsString() articleId?: string;
  @IsOptional() @IsString() warehouseId?: string;
  @IsOptional() @IsNumberString() page?: string;
  @IsOptional() @IsNumberString() pageSize?: string;
}
