import {
  StockTransfer as PrismaStockTransfer,
  StockTransferItem as PrismaStockTransferItem,
} from '@prisma/client';
import { Decimal } from 'decimal.js';
import { StockTransfer } from '../../domain/transfers/stock-transfer.domain';
import { StockTransferItem } from '../../domain/transfers/stock-transfer-item.domain';

type WithItems = PrismaStockTransfer & { items: PrismaStockTransferItem[] };

export class TransfersMapper {
  toDomain(t: WithItems): StockTransfer {
    const items = t.items.map(
      (i) =>
        new StockTransferItem(
          i.id,
          i.transferId,
          i.articleId,
          new Decimal(i.quantity.toString()),
        ),
    );
    return new StockTransfer(
      t.id,
      t.organizationId,
      t.sourceWarehouseId,
      t.destinationWarehouseId,
      t.createdById,
      t.note,
      t.createdAt,
      items,
    );
  }
}
