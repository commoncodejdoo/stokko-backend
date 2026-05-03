import { StockCorrection as PrismaStockCorrection } from '@prisma/client';
import { Decimal } from 'decimal.js';
import {
  CorrectionReason,
  CorrectionType,
  StockCorrection,
} from '../../domain/corrections/correction.domain';

export class CorrectionsMapper {
  toDomain(p: PrismaStockCorrection): StockCorrection {
    return new StockCorrection(
      p.id,
      p.organizationId,
      p.articleId,
      p.warehouseId,
      p.type as CorrectionType,
      new Decimal(p.value.toString()),
      p.reason as CorrectionReason,
      p.note,
      p.createdById,
      p.createdAt,
    );
  }
}
