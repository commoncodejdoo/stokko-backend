import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TxClient } from '../../domain/common/transaction';
import { Warehouse } from '../../domain/warehouses/warehouse.domain';
import {
  CreateWarehouseInput,
  UpdateWarehouseInput,
  WarehousesRepository,
} from '../../domain/warehouses/warehouses.repository';
import { PrismaService } from '../common/prisma/prisma.service';
import { whereNotDeleted } from '../common/where/where-not-deleted';
import { WarehousesMapper } from './warehouses.mapper';

@Injectable()
export class PrismaWarehousesRepository extends WarehousesRepository {
  private readonly mapper = new WarehousesMapper();

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  private client(tx?: TxClient): Prisma.TransactionClient | PrismaService {
    return tx ?? this.prisma;
  }

  async create(input: CreateWarehouseInput, tx?: TxClient): Promise<Warehouse> {
    const row = await this.client(tx).warehouse.create({ data: input });
    return this.mapper.toDomain(row);
  }

  async findById(id: string, tx?: TxClient): Promise<Warehouse | null> {
    const row = await this.client(tx).warehouse.findUnique({ where: { id } });
    return row ? this.mapper.toDomain(row) : null;
  }

  async findByName(
    organizationId: string,
    name: string,
    tx?: TxClient,
  ): Promise<Warehouse | null> {
    const row = await this.client(tx).warehouse.findFirst({
      where: {
        organizationId,
        name: { equals: name.trim(), mode: 'insensitive' },
        ...whereNotDeleted(),
      },
    });
    return row ? this.mapper.toDomain(row) : null;
  }

  async listByOrg(organizationId: string, tx?: TxClient): Promise<Warehouse[]> {
    const rows = await this.client(tx).warehouse.findMany({
      where: { organizationId, ...whereNotDeleted() },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((r) => this.mapper.toDomain(r));
  }

  async update(id: string, patch: UpdateWarehouseInput, tx?: TxClient): Promise<Warehouse> {
    const row = await this.client(tx).warehouse.update({ where: { id }, data: patch });
    return this.mapper.toDomain(row);
  }

  async softDelete(id: string, tx?: TxClient): Promise<Warehouse> {
    const row = await this.client(tx).warehouse.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return this.mapper.toDomain(row);
  }
}
