import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BarcodeRegistry } from '../../domain/barcode-registry/barcode-registry.domain';
import {
  BarcodeRegistryRepository,
  UpsertBarcodeRegistryInput,
} from '../../domain/barcode-registry/barcode-registry.repository';
import { TxClient } from '../../domain/common/transaction';
import { PrismaService } from '../common/prisma/prisma.service';
import { BarcodeRegistryMapper } from './barcode-registry.mapper';

@Injectable()
export class PrismaBarcodeRegistryRepository extends BarcodeRegistryRepository {
  private readonly mapper = new BarcodeRegistryMapper();

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  private client(tx?: TxClient): Prisma.TransactionClient | PrismaService {
    return tx ?? this.prisma;
  }

  async findByBarcode(barcode: string, tx?: TxClient): Promise<BarcodeRegistry | null> {
    const row = await this.client(tx).barcodeRegistry.findUnique({
      where: { barcode },
    });
    return row ? this.mapper.toDomain(row) : null;
  }

  async upsert(input: UpsertBarcodeRegistryInput, tx?: TxClient): Promise<BarcodeRegistry> {
    const client = this.client(tx);
    const existing = await client.barcodeRegistry.findUnique({
      where: { barcode: input.barcode },
    });

    if (!existing) {
      const created = await client.barcodeRegistry.create({
        data: {
          barcode: input.barcode,
          suggestedName: input.suggestedName,
          suggestedBrand: input.suggestedBrand ?? null,
          suggestedCategoryName: input.suggestedCategoryName ?? null,
          suggestedUnit: input.suggestedUnit,
          firstSeenOrgId: input.orgId,
          usingOrgIds: [input.orgId],
        },
      });
      return this.mapper.toDomain(created);
    }

    // Set semantics — `set` (not `push`) so the array can never duplicate
    // the orgId even if upsert runs twice for the same row.
    const nextOrgIds = Array.from(new Set([...existing.usingOrgIds, input.orgId]));

    const updated = await client.barcodeRegistry.update({
      where: { barcode: input.barcode },
      data: {
        suggestedName: input.suggestedName,
        suggestedBrand: input.suggestedBrand ?? existing.suggestedBrand,
        suggestedCategoryName:
          input.suggestedCategoryName ?? existing.suggestedCategoryName,
        suggestedUnit: input.suggestedUnit,
        usingOrgIds: { set: nextOrgIds },
      },
    });
    return this.mapper.toDomain(updated);
  }
}
