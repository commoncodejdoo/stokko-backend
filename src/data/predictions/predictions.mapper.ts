import { PredictionSnapshot as PrismaPredictionSnapshot, Urgency as PrismaUrgency } from '@prisma/client';
import { Decimal } from 'decimal.js';
import { PredictionSnapshot, Urgency } from '../../domain/predictions/prediction-snapshot.domain';

export class PredictionsMapper {
  toDomain(row: PrismaPredictionSnapshot): PredictionSnapshot {
    return new PredictionSnapshot(
      row.id,
      row.organizationId,
      row.warehouseId,
      row.articleId,
      new Decimal(row.currentStock.toString()),
      row.avgDailyConsumption !== null
        ? new Decimal(row.avgDailyConsumption.toString())
        : null,
      row.daysOfSupply !== null ? new Decimal(row.daysOfSupply.toString()) : null,
      row.shouldReorder,
      new Decimal(row.suggestedQty.toString()),
      row.urgency as Urgency,
      row.leadTimeDaysUsed,
      row.safetyDaysUsed,
      row.coverageDaysUsed,
      row.signalWindowDays,
      row.computedAt,
      row.validUntil,
    );
  }

  toPrismaUrgency(u: Urgency): PrismaUrgency {
    return u as PrismaUrgency;
  }
}
