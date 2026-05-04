import {
  Sale as PrismaSale,
  SaleItem as PrismaSaleItem,
  Shift as PrismaShift,
} from '@prisma/client';
import { Decimal } from 'decimal.js';
import { Money } from '../../domain/common/money';
import { SaleItem } from '../../domain/sales/sale-item.domain';
import { Sale } from '../../domain/sales/sale.domain';
import { Shift } from '../../domain/sales/shift.domain';

type SaleWithItems = PrismaSale & { items: PrismaSaleItem[] };

export class SalesMapper {
  toShift(p: PrismaShift, currency: string): Shift {
    return new Shift(
      p.id,
      p.organizationId,
      p.date,
      p.openedAt,
      p.closedAt,
      p.closedById,
      p.status,
      new Decimal(p.totalQuantity.toString()),
      new Money(new Decimal(p.totalRevenue.toString()), currency),
    );
  }

  toSale(p: SaleWithItems, currency: string): Sale {
    const items = p.items.map(
      (i) =>
        new SaleItem(
          i.id,
          i.saleId,
          i.articleId,
          new Decimal(i.quantity.toString()),
          new Money(new Decimal(i.unitPrice.toString()), currency),
        ),
    );
    return new Sale(
      p.id,
      p.organizationId,
      p.shiftId,
      p.warehouseId,
      p.createdById,
      p.createdAt,
      items,
      currency,
    );
  }
}
