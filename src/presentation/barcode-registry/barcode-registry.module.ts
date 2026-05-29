import { Module } from '@nestjs/common';
import { PrismaBarcodeRegistryRepository } from '../../data/barcode-registry/barcode-registry.repository';
import { BarcodeRegistryRepository } from '../../domain/barcode-registry/barcode-registry.repository';
import { BarcodeRegistryService } from '../../domain/barcode-registry/barcode-registry.service';
import { BarcodeRegistryController } from './barcode-registry.controller';

@Module({
  controllers: [BarcodeRegistryController],
  providers: [
    { provide: BarcodeRegistryRepository, useClass: PrismaBarcodeRegistryRepository },
    BarcodeRegistryService,
  ],
  exports: [BarcodeRegistryService],
})
export class BarcodeRegistryModule {}
