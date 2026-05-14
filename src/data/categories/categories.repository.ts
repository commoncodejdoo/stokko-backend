import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Category } from '../../domain/categories/category.domain';
import {
  CategoriesRepository,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../../domain/categories/categories.repository';
import { TxClient } from '../../domain/common/transaction';
import { PrismaService } from '../common/prisma/prisma.service';
import { whereNotDeleted } from '../common/where/where-not-deleted';
import { CategoriesMapper } from './categories.mapper';

@Injectable()
export class PrismaCategoriesRepository extends CategoriesRepository {
  private readonly mapper = new CategoriesMapper();

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  private client(tx?: TxClient): Prisma.TransactionClient | PrismaService {
    return tx ?? this.prisma;
  }

  async create(input: CreateCategoryInput, tx?: TxClient): Promise<Category> {
    const row = await this.client(tx).category.create({
      data: {
        organizationId: input.organizationId,
        name: input.name,
        isPredefined: input.isPredefined ?? false,
      },
    });
    return this.mapper.toDomain(row);
  }

  async findById(id: string, tx?: TxClient): Promise<Category | null> {
    const row = await this.client(tx).category.findUnique({ where: { id } });
    return row ? this.mapper.toDomain(row) : null;
  }

  async findByName(
    organizationId: string,
    name: string,
    tx?: TxClient,
  ): Promise<Category | null> {
    const row = await this.client(tx).category.findFirst({
      where: {
        organizationId,
        name: { equals: name.trim(), mode: 'insensitive' },
        ...whereNotDeleted(),
      },
    });
    return row ? this.mapper.toDomain(row) : null;
  }

  async listByOrg(organizationId: string, tx?: TxClient): Promise<Category[]> {
    const rows = await this.client(tx).category.findMany({
      where: { organizationId, ...whereNotDeleted() },
      orderBy: [{ isPredefined: 'desc' }, { name: 'asc' }],
    });
    return rows.map((r) => this.mapper.toDomain(r));
  }

  async update(id: string, patch: UpdateCategoryInput, tx?: TxClient): Promise<Category> {
    const row = await this.client(tx).category.update({
      where: { id },
      data: patch,
    });
    return this.mapper.toDomain(row);
  }

  async softDelete(id: string, tx?: TxClient): Promise<Category> {
    const row = await this.client(tx).category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return this.mapper.toDomain(row);
  }
}
