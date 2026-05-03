import { Module } from '@nestjs/common';
import { PrismaSuppliersRepository } from '../../data/suppliers/suppliers.repository';
import { SuppliersRepository } from '../../domain/suppliers/suppliers.repository';
import { SuppliersService } from '../../domain/suppliers/suppliers.service';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { SuppliersController } from './suppliers.controller';

@Module({
  imports: [AuditLogModule],
  controllers: [SuppliersController],
  providers: [
    { provide: SuppliersRepository, useClass: PrismaSuppliersRepository },
    SuppliersService,
  ],
  exports: [SuppliersService],
})
export class SuppliersModule {}
