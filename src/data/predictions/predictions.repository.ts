import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PredictionSnapshot } from '../../domain/predictions/prediction-snapshot.domain';
import {
  CreatePredictionSnapshotInput,
  ListCurrentSnapshotsFilter,
  PredictionsRepository,
} from '../../domain/predictions/predictions.repository';
import { TxClient } from '../../domain/common/transaction';
import { PrismaService } from '../common/prisma/prisma.service';
import { PredictionsMapper } from './predictions.mapper';

@Injectable()
export class PrismaPredictionsRepository extends PredictionsRepository {
  private readonly mapper = new PredictionsMapper();

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  private client(tx?: TxClient): Prisma.TransactionClient | PrismaService {
    return tx ?? this.prisma;
  }

  async create(
    input: CreatePredictionSnapshotInput,
    tx?: TxClient,
  ): Promise<PredictionSnapshot> {
    const row = await this.client(tx).predictionSnapshot.create({
      data: {
        organizationId: input.organizationId,
        warehouseId: input.warehouseId,
        articleId: input.articleId,
        currentStock: new Prisma.Decimal(input.currentStock.toFixed()),
        avgDailyConsumption: input.avgDailyConsumption
          ? new Prisma.Decimal(input.avgDailyConsumption.toFixed())
          : null,
        daysOfSupply: input.daysOfSupply
          ? new Prisma.Decimal(input.daysOfSupply.toFixed())
          : null,
        shouldReorder: input.shouldReorder,
        suggestedQty: new Prisma.Decimal(input.suggestedQty.toFixed()),
        urgency: this.mapper.toPrismaUrgency(input.urgency),
        leadTimeDaysUsed: input.leadTimeDaysUsed,
        safetyDaysUsed: input.safetyDaysUsed,
        coverageDaysUsed: input.coverageDaysUsed,
        signalWindowDays: input.signalWindowDays,
        validUntil: input.validUntil,
      },
    });
    return this.mapper.toDomain(row);
  }

  async listLatest(
    filter: ListCurrentSnapshotsFilter,
    tx?: TxClient,
  ): Promise<PredictionSnapshot[]> {
    const where: Prisma.PredictionSnapshotWhereInput = {
      organizationId: filter.organizationId,
    };
    if (filter.warehouseId) where.warehouseId = filter.warehouseId;

    const rows = await this.client(tx).predictionSnapshot.findMany({
      where,
      orderBy: { computedAt: 'desc' },
    });

    // Dedupe per (warehouseId, articleId) — first occurrence wins (already
    // ordered by newest). Latest cron run's rows share the same computedAt
    // and come before older history.
    const seen = new Set<string>();
    const latest: typeof rows = [];
    for (const r of rows) {
      const key = `${r.warehouseId}|${r.articleId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      latest.push(r);
    }

    let domains = latest.map((r) => this.mapper.toDomain(r));
    if (filter.urgency) {
      domains = domains.filter((d) => d.urgency === filter.urgency);
    }
    if (filter.shouldReorderOnly) {
      domains = domains.filter((d) => d.shouldReorder);
    }
    return domains;
  }

  async findLatestForArticleWarehouse(
    organizationId: string,
    articleId: string,
    warehouseId: string,
    tx?: TxClient,
  ): Promise<PredictionSnapshot | null> {
    const row = await this.client(tx).predictionSnapshot.findFirst({
      where: { organizationId, articleId, warehouseId },
      orderBy: { computedAt: 'desc' },
    });
    return row ? this.mapper.toDomain(row) : null;
  }
}
