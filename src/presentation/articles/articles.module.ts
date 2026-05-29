import { forwardRef, Module } from '@nestjs/common';
import { PrismaArticlesRepository } from '../../data/articles/articles.repository';
import { ArticlesRepository } from '../../domain/articles/articles.repository';
import { ArticlesService } from '../../domain/articles/articles.service';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { BarcodeRegistryModule } from '../barcode-registry/barcode-registry.module';
import { CategoriesModule } from '../categories/categories.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { StockModule } from '../stock/stock.module';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { WarehousesModule } from '../warehouses/warehouses.module';
import { UsersModule } from '../users/users.module';
import { ArticlesController } from './articles.controller';

@Module({
  imports: [
    OrganizationsModule,
    CategoriesModule,
    SuppliersModule,
    BarcodeRegistryModule,
    // WarehousesModule depends on ArticlesService for the
    // `GET /warehouses/:id/articles` enrichment endpoint, which creates a
    // cycle. forwardRef breaks it on both sides.
    forwardRef(() => WarehousesModule),
    StockModule,
    AuditLogModule,
    // UsersModule sits inside a cross-module cycle when JwtStrategy pulls
    // in OrganizationsService (auth → users → user-warehouse-access →
    // warehouses → articles → users). forwardRef breaks the JS-level cycle.
    forwardRef(() => UsersModule),
  ],
  controllers: [ArticlesController],
  providers: [
    { provide: ArticlesRepository, useClass: PrismaArticlesRepository },
    ArticlesService,
  ],
  exports: [ArticlesService],
})
export class ArticlesModule {}
