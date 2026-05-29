import { BarcodeRegistry as PrismaBarcodeRegistry } from '@prisma/client';
import { BarcodeRegistry } from '../../domain/barcode-registry/barcode-registry.domain';
import { Unit } from '../../domain/common/unit';

export class BarcodeRegistryMapper {
  toDomain(p: PrismaBarcodeRegistry): BarcodeRegistry {
    return new BarcodeRegistry(
      p.barcode,
      p.suggestedName,
      p.suggestedBrand,
      p.suggestedCategoryName,
      p.suggestedUnit as Unit,
      p.firstSeenOrgId,
      p.firstSeenAt,
      p.lastSeenAt,
      p.usingOrgIds,
    );
  }
}
