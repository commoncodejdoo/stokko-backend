import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  CreateNarrativeInput,
  NarrativesRepository,
} from '../../domain/narratives/narratives.repository';
import { RecommendationNarrative } from '../../domain/narratives/recommendation-narrative.domain';
import { TxClient } from '../../domain/common/transaction';
import { PrismaService } from '../common/prisma/prisma.service';
import { NarrativesMapper } from './narratives.mapper';

@Injectable()
export class PrismaNarrativesRepository extends NarrativesRepository {
  private readonly mapper = new NarrativesMapper();

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  private client(tx?: TxClient): Prisma.TransactionClient | PrismaService {
    return tx ?? this.prisma;
  }

  async create(
    input: CreateNarrativeInput,
    tx?: TxClient,
  ): Promise<RecommendationNarrative> {
    const row = await this.client(tx).recommendationNarrative.create({
      data: {
        organizationId: input.organizationId,
        kind: this.mapper.toPrismaKind(input.kind),
        body: input.body,
        articleId: input.articleId ?? null,
        warehouseId: input.warehouseId ?? null,
        modelUsed: input.modelUsed,
        tokensIn: input.tokensIn,
        tokensOut: input.tokensOut,
        cachedTokens: input.cachedTokens,
        costUsd: new Prisma.Decimal(input.costUsd.toFixed(6)),
        validForDate: input.validForDate ?? null,
      },
    });
    return this.mapper.toDomain(row);
  }

  async findDigestByDate(
    organizationId: string,
    date: Date,
    tx?: TxClient,
  ): Promise<RecommendationNarrative | null> {
    const row = await this.client(tx).recommendationNarrative.findFirst({
      where: {
        organizationId,
        kind: 'DAILY_DIGEST',
        validForDate: date,
      },
      orderBy: { createdAt: 'desc' },
    });
    return row ? this.mapper.toDomain(row) : null;
  }

  async findRecentExplanation(
    organizationId: string,
    articleId: string,
    warehouseId: string,
    minCreatedAt: Date,
    tx?: TxClient,
  ): Promise<RecommendationNarrative | null> {
    const row = await this.client(tx).recommendationNarrative.findFirst({
      where: {
        organizationId,
        kind: 'ITEM_EXPLANATION',
        articleId,
        warehouseId,
        createdAt: { gte: minCreatedAt },
      },
      orderBy: { createdAt: 'desc' },
    });
    return row ? this.mapper.toDomain(row) : null;
  }
}
