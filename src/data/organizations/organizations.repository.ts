import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Organization } from '../../domain/organizations/organization.domain';
import {
  CreateOrganizationInput,
  ListOrganizationsOptions,
  OrganizationsRepository,
  UpdateOrganizationInput,
} from '../../domain/organizations/organizations.repository';
import { TxClient } from '../../domain/common/transaction';
import { PrismaService } from '../common/prisma/prisma.service';
import { OrganizationsMapper } from './organizations.mapper';

@Injectable()
export class PrismaOrganizationsRepository extends OrganizationsRepository {
  private readonly mapper = new OrganizationsMapper();

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  private client(tx?: TxClient): Prisma.TransactionClient | PrismaService {
    return tx ?? this.prisma;
  }

  async create(input: CreateOrganizationInput, tx?: TxClient): Promise<Organization> {
    const row = await this.client(tx).organization.create({
      data: {
        name: input.name,
        currency: input.currency ?? 'EUR',
      },
    });
    return this.mapper.toDomain(row);
  }

  async findById(id: string, tx?: TxClient): Promise<Organization | null> {
    const row = await this.client(tx).organization.findUnique({ where: { id } });
    return row ? this.mapper.toDomain(row) : null;
  }

  async listAll(opts: ListOrganizationsOptions, tx?: TxClient): Promise<Organization[]> {
    const where = opts.search
      ? { name: { contains: opts.search, mode: Prisma.QueryMode.insensitive } }
      : {};
    const rows = await this.client(tx).organization.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: opts.skip,
      take: opts.take,
    });
    return rows.map((r) => this.mapper.toDomain(r));
  }

  async countAll(search?: string, tx?: TxClient): Promise<number> {
    const where = search
      ? { name: { contains: search, mode: Prisma.QueryMode.insensitive } }
      : {};
    return this.client(tx).organization.count({ where });
  }

  async update(id: string, patch: UpdateOrganizationInput, tx?: TxClient): Promise<Organization> {
    const row = await this.client(tx).organization.update({
      where: { id },
      data: patch,
    });
    return this.mapper.toDomain(row);
  }

  async countUsers(id: string, tx?: TxClient): Promise<number> {
    return this.client(tx).user.count({ where: { organizationId: id } });
  }
}
