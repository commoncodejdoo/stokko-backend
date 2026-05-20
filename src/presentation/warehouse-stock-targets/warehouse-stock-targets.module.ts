import { Module } from '@nestjs/common';
import { PrismaWarehouseStockTargetsRepository } from '../../data/warehouse-stock-targets/warehouse-stock-targets.repository';
import { WarehouseStockTargetsRepository } from '../../domain/warehouse-stock-targets/warehouse-stock-targets.repository';
import { WarehouseStockTargetsService } from '../../domain/warehouse-stock-targets/warehouse-stock-targets.service';
import { ArticlesModule } from '../articles/articles.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { WarehousesModule } from '../warehouses/warehouses.module';
import { WarehouseStockTargetsController } from './warehouse-stock-targets.controller';

@Module({
  imports: [AuditLogModule, WarehousesModule, ArticlesModule],
  controllers: [WarehouseStockTargetsController],
  providers: [
    {
      provide: WarehouseStockTargetsRepository,
      useClass: PrismaWarehouseStockTargetsRepository,
    },
    WarehouseStockTargetsService,
  ],
  exports: [WarehouseStockTargetsService],
})
export class WarehouseStockTargetsModule {}
