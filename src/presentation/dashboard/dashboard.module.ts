import { Module } from '@nestjs/common';
import { DashboardService } from '../../domain/dashboard/dashboard.service';
import { ArticlesModule } from '../articles/articles.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { ProcurementsModule } from '../procurements/procurements.module';
import { StockModule } from '../stock/stock.module';
import { UsersModule } from '../users/users.module';
import { WarehousesModule } from '../warehouses/warehouses.module';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [
    OrganizationsModule,
    WarehousesModule,
    ArticlesModule,
    StockModule,
    ProcurementsModule,
    AuditLogModule,
    UsersModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
