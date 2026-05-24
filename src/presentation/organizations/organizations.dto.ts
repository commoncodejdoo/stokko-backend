import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateOrgSettingsDto {
  @IsOptional()
  @IsBoolean()
  priceTrackingEnabled?: boolean;
}
