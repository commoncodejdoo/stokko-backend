import { AdminUser } from './admin-user.domain';

export interface CreateAdminUserInput {
  email: string;
  passwordHash: string;
}

export abstract class AdminUsersRepository {
  abstract create(input: CreateAdminUserInput): Promise<AdminUser>;
  abstract findByEmail(email: string): Promise<AdminUser | null>;
}
