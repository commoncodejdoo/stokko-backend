import { forwardRef, Module } from '@nestjs/common';
import { PrismaWarehousesRepository } from '../../data/warehouses/warehouses.repository';
import { WarehousesRepository } from '../../domain/warehouses/warehouses.repository';
import { WarehousesService } from '../../domain/warehouses/warehouses.service';
import { ArticlesModule } from '../articles/articles.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { StockModule } from '../stock/stock.module';
import { UserWarehouseAccessModule } from '../user-warehouse-access/user-warehouse-access.module';
import { WarehousesController } from './warehouses.controller';

@Module({
  imports: [
    AuditLogModule,
    StockModule,
    OrganizationsModule,
    // ArticlesModule already depends on WarehousesModule (for stock seeding
    // on article create); use forwardRef to break the circular import.
    forwardRef(() => ArticlesModule),
    forwardRef(() => UserWarehouseAccessModule),
  ],
  controllers: [WarehousesController],
  providers: [
    { provide: WarehousesRepository, useClass: PrismaWarehousesRepository },
    WarehousesService,
  ],
  exports: [WarehousesService],
})
export class WarehousesModule {}
