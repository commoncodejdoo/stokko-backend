import { User as PrismaUser } from '@prisma/client';
import { Role } from '../../domain/common/role';
import { User } from '../../domain/users/user.domain';

export class UsersMapper {
  toDomain(p: PrismaUser): User {
    return new User(
      p.id,
      p.organizationId,
      p.email,
      p.passwordHash,
      p.role as Role,
      p.firstName,
      p.lastName,
      p.mustChangePassword,
      p.isActive,
      p.createdAt,
      p.updatedAt,
      p.lastLoginAt,
    );
  }
}
