import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './data/common/prisma/prisma.module';
import { AdminModule } from './presentation/admin/admin.module';
import { ArticlesModule } from './presentation/articles/articles.module';
import { AuditLogModule } from './presentation/audit-log/audit-log.module';
import { AuthModule } from './presentation/auth/auth.module';
import { BulkImportModule } from './presentation/bulk-import/bulk-import.module';
import { CategoriesModule } from './presentation/categories/categories.module';
import { HealthModule } from './presentation/common/health/health.module';
import { CorrectionsModule } from './presentation/corrections/corrections.module';
import { DashboardModule } from './presentation/dashboard/dashboard.module';
import { NarrativesModule } from './presentation/narratives/narratives.module';
import { OrganizationsModule } from './presentation/organizations/organizations.module';
import { PredictionsModule } from './presentation/predictions/predictions.module';
import { ProcurementsModule } from './presentation/procurements/procurements.module';
import { SalesModule } from './presentation/sales/sales.module';
import { ShoppingListsModule } from './presentation/shopping-lists/shopping-lists.module';
import { StockModule } from './presentation/stock/stock.module';
import { SuppliersModule } from './presentation/suppliers/suppliers.module';
import { TransfersModule } from './presentation/transfers/transfers.module';
import { UsersModule } from './presentation/users/users.module';
import { WarehousesModule } from './presentation/warehouses/warehouses.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    AuditLogModule,
    OrganizationsModule,
    CategoriesModule,
    WarehousesModule,
    SuppliersModule,
    StockModule,
    ArticlesModule,
    ProcurementsModule,
    CorrectionsModule,
    TransfersModule,
    SalesModule,
    UsersModule,
    AuthModule,
    DashboardModule,
    AdminModule,
    BulkImportModule,
    PredictionsModule,
    ShoppingListsModule,
    NarrativesModule,
  ],
})
export class AppModule {}

