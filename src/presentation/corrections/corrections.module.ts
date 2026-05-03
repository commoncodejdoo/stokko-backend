import { Module } from '@nestjs/common';
import { PrismaCorrectionsRepository } from '../../data/corrections/corrections.repository';
import { CorrectionsRepository } from '../../domain/corrections/corrections.repository';
import { CorrectionsService } from '../../domain/corrections/corrections.service';
import { ArticlesModule } from '../articles/articles.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { StockModule } from '../stock/stock.module';
import { WarehousesModule } from '../warehouses/warehouses.module';
import { CorrectionsController } from './corrections.controller';

@Module({
  imports: [
    OrganizationsModule,
    ArticlesModule,
    WarehousesModule,
    StockModule,
    AuditLogModule,
  ],
  controllers: [CorrectionsController],
  providers: [
    { provide: CorrectionsRepository, useClass: PrismaCorrectionsRepository },
    CorrectionsService,
  ],
  exports: [CorrectionsService],
})
export class CorrectionsModule {}
