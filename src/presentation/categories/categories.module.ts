import { Module } from '@nestjs/common';
import { PrismaCategoriesRepository } from '../../data/categories/categories.repository';
import { CategoriesRepository } from '../../domain/categories/categories.repository';
import { CategoriesService } from '../../domain/categories/categories.service';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { CategoriesController } from './categories.controller';

@Module({
  imports: [AuditLogModule],
  controllers: [CategoriesController],
  providers: [
    { provide: CategoriesRepository, useClass: PrismaCategoriesRepository },
    CategoriesService,
  ],
  exports: [CategoriesService],
})
export class CategoriesModule {}
