import { AdminUser as PrismaAdminUser } from '@prisma/client';
import { AdminUser } from '../../domain/admin/admin-user.domain';

export class AdminUserMapper {
  toDomain(p: PrismaAdminUser): AdminUser {
    return new AdminUser(p.id, p.email, p.passwordHash, p.createdAt, p.updatedAt);
  }
}
