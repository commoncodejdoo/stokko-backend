import { Module } from '@nestjs/common';
import { PrismaWarehousesRepository } from '../../data/warehouses/warehouses.repository';
import { WarehousesRepository } from '../../domain/warehouses/warehouses.repository';
import { WarehousesService } from '../../domain/warehouses/warehouses.service';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { WarehousesController } from './warehouses.controller';

@Module({
  imports: [AuditLogModule],
  controllers: [WarehousesController],
  providers: [
    { provide: WarehousesRepository, useClass: PrismaWarehousesRepository },
    WarehousesService,
  ],
  exports: [WarehousesService],
})
export class WarehousesModule {}
