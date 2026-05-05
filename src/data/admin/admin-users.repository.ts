import { Injectable } from '@nestjs/common';
import { AdminUser } from '../../domain/admin/admin-user.domain';
import {
  AdminUsersRepository,
  CreateAdminUserInput,
} from '../../domain/admin/admin-users.repository';
import { PrismaService } from '../common/prisma/prisma.service';
import { AdminUserMapper } from './admin-user.mapper';

@Injectable()
export class PrismaAdminUsersRepository extends AdminUsersRepository {
  private readonly mapper = new AdminUserMapper();

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(input: CreateAdminUserInput): Promise<AdminUser> {
    const row = await this.prisma.adminUser.create({
      data: { email: input.email, passwordHash: input.passwordHash },
    });
    return this.mapper.toDomain(row);
  }

  async findByEmail(email: string): Promise<AdminUser | null> {
    const row = await this.prisma.adminUser.findUnique({ where: { email } });
    return row ? this.mapper.toDomain(row) : null;
  }
}
