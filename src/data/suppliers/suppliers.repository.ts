import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TxClient } from '../../domain/common/transaction';
import { Supplier } from '../../domain/suppliers/supplier.domain';
import {
  CreateSupplierInput,
  SuppliersRepository,
  UpdateSupplierInput,
} from '../../domain/suppliers/suppliers.repository';
import { PrismaService } from '../common/prisma/prisma.service';
import { whereNotDeleted } from '../common/where/where-not-deleted';
import { SuppliersMapper } from './suppliers.mapper';

@Injectable()
export class PrismaSuppliersRepository extends SuppliersRepository {
  private readonly mapper = new SuppliersMapper();

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  private client(tx?: TxClient): Prisma.TransactionClient | PrismaService {
    return tx ?? this.prisma;
  }

  async create(input: CreateSupplierInput, tx?: TxClient): Promise<Supplier> {
    const row = await this.client(tx).supplier.create({
      data: {
        organizationId: input.organizationId,
        name: input.name,
        contactPerson: input.contactPerson ?? null,
        phone: input.phone ?? null,
        email: input.email ?? null,
        note: input.note ?? null,
      },
    });
    return this.mapper.toDomain(row);
  }

  async findById(id: string, tx?: TxClient): Promise<Supplier | null> {
    const row = await this.client(tx).supplier.findUnique({ where: { id } });
    return row ? this.mapper.toDomain(row) : null;
  }

  async listByOrg(organizationId: string, tx?: TxClient): Promise<Supplier[]> {
    const rows = await this.client(tx).supplier.findMany({
      where: { organizationId, ...whereNotDeleted() },
      orderBy: { name: 'asc' },
    });
    return rows.map((r) => this.mapper.toDomain(r));
  }

  async update(id: string, patch: UpdateSupplierInput, tx?: TxClient): Promise<Supplier> {
    const row = await this.client(tx).supplier.update({ where: { id }, data: patch });
    return this.mapper.toDomain(row);
  }

  async softDelete(id: string, tx?: TxClient): Promise<Supplier> {
    const row = await this.client(tx).supplier.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return this.mapper.toDomain(row);
  }
}
