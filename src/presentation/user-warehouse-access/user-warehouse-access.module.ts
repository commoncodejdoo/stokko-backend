import { Module, forwardRef } from '@nestjs/common';
import { PrismaUserWarehouseAccessRepository } from '../../data/user-warehouse-access/user-warehouse-access.repository';
import { UserWarehouseAccessRepository } from '../../domain/user-warehouse-access/user-warehouse-access.repository';
import { UserWarehouseAccessService } from '../../domain/user-warehouse-access/user-warehouse-access.service';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { UsersModule } from '../users/users.module';
import { WarehousesModule } from '../warehouses/warehouses.module';

/**
 * Per-warehouse access scoping for EMPLOYEE users.
 *
 * Imported by `UsersManagementController` (endpoint `/users/:id/warehouses`)
 * and `WarehousesController` (endpoint `/warehouses/:id/users`) so the same
 * underlying table can be edited from either axis.
 */
@Module({
  imports: [
    AuditLogModule,
    forwardRef(() => UsersModule),
    forwardRef(() => WarehousesModule),
  ],
  providers: [
    {
      provide: UserWarehouseAccessRepository,
      useClass: PrismaUserWarehouseAccessRepository,
    },
    UserWarehouseAccessService,
  ],
  exports: [UserWarehouseAccessService],
})
export class UserWarehouseAccessModule {}
