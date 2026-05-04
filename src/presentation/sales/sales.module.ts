import { Module } from '@nestjs/common';
import { PrismaSalesRepository } from '../../data/sales/sales.repository';
import { SalesReportService } from '../../domain/sales/sales-report.service';
import { SalesRepository } from '../../domain/sales/sales.repository';
import { SalesService } from '../../domain/sales/sales.service';
import { ArticlesModule } from '../articles/articles.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { StockModule } from '../stock/stock.module';
import { WarehousesModule } from '../warehouses/warehouses.module';
import { SalesReportController } from './sales-report.controller';
import { ShiftsController } from './shifts.controller';

@Module({
  imports: [
    OrganizationsModule,
    WarehousesModule,
    ArticlesModule,
    StockModule,
    AuditLogModule,
  ],
  controllers: [ShiftsController, SalesReportController],
  providers: [
    { provide: SalesRepository, useClass: PrismaSalesRepository },
    SalesService,
    SalesReportService,
  ],
  exports: [SalesService, SalesReportService],
})
export class SalesModule {}
