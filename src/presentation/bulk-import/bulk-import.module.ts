import { Module } from '@nestjs/common';
import { BulkImportTemplateGenerator } from '../../domain/bulk-import/bulk-import-template.generator';
import { BulkImportService } from '../../domain/bulk-import/bulk-import.service';
import { ArticlesModule } from '../articles/articles.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { CategoriesModule } from '../categories/categories.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { UsersModule } from '../users/users.module';
import { WarehousesModule } from '../warehouses/warehouses.module';
import { BulkImportController } from './bulk-import.controller';

@Module({
  imports: [
    OrganizationsModule,
    CategoriesModule,
    WarehousesModule,
    SuppliersModule,
    ArticlesModule,
    AuditLogModule,
    UsersModule,
  ],
  controllers: [BulkImportController],
  providers: [BulkImportService, BulkImportTemplateGenerator],
})
export class BulkImportModule {}
