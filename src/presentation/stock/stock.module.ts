import { Module } from '@nestjs/common';
import { PrismaStockRepository } from '../../data/stock/stock.repository';
import { StockRepository } from '../../domain/stock/stock.repository';
import { StockService } from '../../domain/stock/stock.service';

/**
 * Stock module — no controller. StockEntry is exposed indirectly through
 * Articles (per-article stock list in detail response) and Warehouses
 * (per-warehouse listings). Procurement and Correction features inject
 * `StockService` to mutate quantities.
 */
@Module({
  providers: [
    { provide: StockRepository, useClass: PrismaStockRepository },
    StockService,
  ],
  exports: [StockService],
})
export class StockModule {}
