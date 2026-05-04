import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Decimal } from 'decimal.js';
import { Article } from '../../domain/articles/article.domain';
import {
  ArticlesRepository,
  CreateArticleInput,
  ListArticlesFilter,
  UpdateArticleInput,
} from '../../domain/articles/articles.repository';
import { TxClient } from '../../domain/common/transaction';
import { PrismaService } from '../common/prisma/prisma.service';
import { whereNotDeleted } from '../common/where/where-not-deleted';
import { ArticlesMapper } from './articles.mapper';

@Injectable()
export class PrismaArticlesRepository extends ArticlesRepository {
  private readonly mapper = new ArticlesMapper();

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  private client(tx?: TxClient): Prisma.TransactionClient | PrismaService {
    return tx ?? this.prisma;
  }

  private toPrismaDecimal(d: Decimal): Prisma.Decimal {
    return new Prisma.Decimal(d.toFixed());
  }

  async create(input: CreateArticleInput, currency: string, tx?: TxClient): Promise<Article> {
    const row = await this.client(tx).article.create({
      data: {
        organizationId: input.organizationId,
        sku: input.sku,
        name: input.name,
        purchasePrice: this.toPrismaDecimal(input.purchasePrice),
        salePrice: this.toPrismaDecimal(input.salePrice),
        unit: input.unit,
        categoryId: input.categoryId,
        supplierId: input.supplierId ?? null,
        thresholdWarning: this.toPrismaDecimal(input.thresholdWarning),
        thresholdCritical: this.toPrismaDecimal(input.thresholdCritical),
        createdById: input.createdById,
      },
    });
    return this.mapper.toDomain(row, currency);
  }

  async findById(id: string, currency: string, tx?: TxClient): Promise<Article | null> {
    const row = await this.client(tx).article.findUnique({ where: { id } });
    return row ? this.mapper.toDomain(row, currency) : null;
  }

  async list(
    filter: ListArticlesFilter,
    currency: string,
    tx?: TxClient,
  ): Promise<Article[]> {
    const where: Prisma.ArticleWhereInput = {
      organizationId: filter.organizationId,
      ...whereNotDeleted(),
    };
    if (filter.categoryId) where.categoryId = filter.categoryId;
    if (filter.supplierId) where.supplierId = filter.supplierId;
    if (filter.search) {
      const q = filter.search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { sku: { contains: q, mode: 'insensitive' } },
      ];
    }

    const rows = await this.client(tx).article.findMany({
      where,
      orderBy: { name: 'asc' },
    });
    return rows.map((r) => this.mapper.toDomain(r, currency));
  }

  async update(
    id: string,
    patch: UpdateArticleInput,
    currency: string,
    tx?: TxClient,
  ): Promise<Article> {
    const data: Prisma.ArticleUpdateInput = {};
    if (patch.sku !== undefined) data.sku = patch.sku;
    if (patch.name !== undefined) data.name = patch.name;
    if (patch.purchasePrice !== undefined) data.purchasePrice = this.toPrismaDecimal(patch.purchasePrice);
    if (patch.salePrice !== undefined) data.salePrice = this.toPrismaDecimal(patch.salePrice);
    if (patch.unit !== undefined) data.unit = patch.unit;
    if (patch.categoryId !== undefined) data.category = { connect: { id: patch.categoryId } };
    if (patch.supplierId !== undefined) {
      data.supplier =
        patch.supplierId === null ? { disconnect: true } : { connect: { id: patch.supplierId } };
    }
    if (patch.thresholdWarning !== undefined) {
      data.thresholdWarning = this.toPrismaDecimal(patch.thresholdWarning);
    }
    if (patch.thresholdCritical !== undefined) {
      data.thresholdCritical = this.toPrismaDecimal(patch.thresholdCritical);
    }

    const row = await this.client(tx).article.update({
      where: { id },
      data,
    });
    return this.mapper.toDomain(row, currency);
  }

  async softDelete(id: string, currency: string, tx?: TxClient): Promise<Article> {
    const row = await this.client(tx).article.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return this.mapper.toDomain(row, currency);
  }

  async existsBySku(organizationId: string, sku: string, tx?: TxClient): Promise<boolean> {
    const row = await this.client(tx).article.findUnique({
      where: { organizationId_sku: { organizationId, sku } },
    });
    return !!row;
  }
}
