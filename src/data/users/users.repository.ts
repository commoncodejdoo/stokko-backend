import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TxClient } from '../../domain/common/transaction';
import { User } from '../../domain/users/user.domain';
import {
  CreateUserInput,
  UpdateUserInput,
  UsersRepository,
} from '../../domain/users/users.repository';
import { PrismaService } from '../common/prisma/prisma.service';
import { UsersMapper } from './users.mapper';

@Injectable()
export class PrismaUsersRepository extends UsersRepository {
  private readonly mapper = new UsersMapper();

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  private client(tx?: TxClient): Prisma.TransactionClient | PrismaService {
    return tx ?? this.prisma;
  }

  async create(input: CreateUserInput, tx?: TxClient): Promise<User> {
    const row = await this.client(tx).user.create({
      data: {
        organizationId: input.organizationId,
        email: input.email,
        passwordHash: input.passwordHash,
        role: input.role,
        firstName: input.firstName,
        lastName: input.lastName,
        mustChangePassword: input.mustChangePassword ?? true,
      },
    });
    return this.mapper.toDomain(row);
  }

  async findById(id: string, tx?: TxClient): Promise<User | null> {
    const row = await this.client(tx).user.findUnique({ where: { id } });
    return row ? this.mapper.toDomain(row) : null;
  }

  async findByEmailInOrg(
    email: string,
    organizationId: string,
    tx?: TxClient,
  ): Promise<User | null> {
    const row = await this.client(tx).user.findUnique({
      where: { organizationId_email: { organizationId, email } },
    });
    return row ? this.mapper.toDomain(row) : null;
  }

  async findAllByEmail(email: string, tx?: TxClient): Promise<User[]> {
    const rows = await this.client(tx).user.findMany({ where: { email } });
    return rows.map((r) => this.mapper.toDomain(r));
  }

  async update(id: string, patch: UpdateUserInput, tx?: TxClient): Promise<User> {
    const row = await this.client(tx).user.update({
      where: { id },
      data: patch,
    });
    return this.mapper.toDomain(row);
  }

  async listByOrg(organizationId: string, tx?: TxClient): Promise<User[]> {
    const rows = await this.client(tx).user.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((r) => this.mapper.toDomain(r));
  }
}
