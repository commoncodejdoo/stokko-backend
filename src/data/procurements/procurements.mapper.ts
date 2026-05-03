import {
  Procurement as PrismaProcurement,
  ProcurementItem as PrismaProcurementItem,
} from '@prisma/client';
import { Decimal } from 'decimal.js';
import { Money } from '../../domain/common/money';
import { Procurement } from '../../domain/procurements/procurement.domain';
import { ProcurementItem } from '../../domain/procurements/procurement-item.domain';

type WithItems = PrismaProcurement & { items: PrismaProcurementItem[] };

export class ProcurementsMapper {
  toDomain(p: WithItems, currency: string): Procurement {
    const items = p.items.map(
      (i) =>
        new ProcurementItem(
          i.id,
          i.procurementId,
          i.articleId,
          new Decimal(i.quantity.toString()),
          new Money(new Decimal(i.purchasePrice.toString()), currency),
        ),
    );
    return new Procurement(
      p.id,
      p.organizationId,
      p.supplierId,
      p.warehouseId,
      p.createdById,
      p.note,
      p.createdAt,
      items,
      currency,
    );
  }
}
