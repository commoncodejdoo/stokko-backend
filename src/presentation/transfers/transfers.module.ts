import { Module } from '@nestjs/common';
import { PrismaTransfersRepository } from '../../data/transfers/transfers.repository';
import { TransfersRepository } from '../../domain/transfers/transfers.repository';
import { TransfersService } from '../../domain/transfers/transfers.service';
import { ArticlesModule } from '../articles/articles.module';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { StockModule } from '../stock/stock.module';
import { WarehousesModule } from '../warehouses/warehouses.module';
import { TransfersController } from './transfers.controller';

@Module({
  imports: [WarehousesModule, ArticlesModule, StockModule, AuditLogModule],
  controllers: [TransfersController],
  providers: [
    { provide: TransfersRepository, useClass: PrismaTransfersRepository },
    TransfersService,
  ],
  exports: [TransfersService],
})
export class TransfersModule {}
