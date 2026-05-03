import { Module } from '@nestjs/common';
import { PrismaProcurementsRepository } from '../../data/procurements/procurements.repository';
import { ProcurementsRepository } from '../../domain/procurements/procurements.repository';
import { ProcurementsService } from '../../domain/procurements/procurements.service';
import { ArticlesModule } from '../articles/articles.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { StockModule } from '../stock/stock.module';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { WarehousesModule } from '../warehouses/warehouses.module';
import { ProcurementsController } from './procurements.controller';

@Module({
  imports: [
    OrganizationsModule,
    SuppliersModule,
    WarehousesModule,
    ArticlesModule,
    StockModule,
    AuditLogModule,
  ],
  controllers: [ProcurementsController],
  providers: [
    { provide: ProcurementsRepository, useClass: PrismaProcurementsRepository },
    ProcurementsService,
  ],
  exports: [ProcurementsService],
})
export class ProcurementsModule {}
