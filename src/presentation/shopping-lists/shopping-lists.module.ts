import { Module } from '@nestjs/common';
import { PrismaShoppingListsRepository } from '../../data/shopping-lists/shopping-lists.repository';
import { ShoppingListsRepository } from '../../domain/shopping-lists/shopping-lists.repository';
import { ShoppingListsService } from '../../domain/shopping-lists/shopping-lists.service';
import { ArticlesModule } from '../articles/articles.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { PredictionsModule } from '../predictions/predictions.module';
import { ProcurementsModule } from '../procurements/procurements.module';
import { WarehousesModule } from '../warehouses/warehouses.module';
import { ShoppingListsController } from './shopping-lists.controller';

@Module({
  imports: [
    OrganizationsModule,
    ArticlesModule,
    WarehousesModule,
    PredictionsModule,
    ProcurementsModule,
    AuditLogModule,
  ],
  controllers: [ShoppingListsController],
  providers: [
    { provide: ShoppingListsRepository, useClass: PrismaShoppingListsRepository },
    ShoppingListsService,
  ],
  exports: [ShoppingListsService],
})
export class ShoppingListsModule {}
