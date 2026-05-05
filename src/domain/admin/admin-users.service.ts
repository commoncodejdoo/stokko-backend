import { Injectable } from '@nestjs/common';
import { PasswordHasher } from '../common/password-hasher';
import { AdminUser } from './admin-user.domain';
import { AdminUserNotFoundError } from './admin.errors';
import { AdminUsersRepository, CreateAdminUserInput } from './admin-users.repository';

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly repo: AdminUsersRepository,
    private readonly hasher: PasswordHasher,
  ) {}

  async create(email: string, plainPassword: string): Promise<AdminUser> {
    const passwordHash = await this.hasher.hash(plainPassword);
    return this.repo.create({ email, passwordHash });
  }

  async findByEmail(email: string): Promise<AdminUser | null> {
    return this.repo.findByEmail(email);
  }

  async requireByEmail(email: string): Promise<AdminUser> {
    const admin = await this.repo.findByEmail(email);
    if (!admin) throw new AdminUserNotFoundError(email);
    return admin;
  }
}
