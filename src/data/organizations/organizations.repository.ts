import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Organization } from '../../domain/organizations/organization.domain';
import {
  CreateOrganizationInput,
  OrganizationsRepository,
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
}
