import { Module } from '@nestjs/common';
import { PrismaPredictionsRepository } from '../../data/predictions/predictions.repository';
import { PredictionsRepository } from '../../domain/predictions/predictions.repository';
import { PredictionsService } from '../../domain/predictions/predictions.service';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { PredictionsAdminController } from './predictions-admin.controller';
import { PredictionsController } from './predictions.controller';

@Module({
  imports: [OrganizationsModule, AuditLogModule],
  controllers: [PredictionsController, PredictionsAdminController],
  providers: [
    { provide: PredictionsRepository, useClass: PrismaPredictionsRepository },
    PredictionsService,
  ],
  exports: [PredictionsService],
})
export class PredictionsModule {}
