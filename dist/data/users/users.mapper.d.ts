import { User as PrismaUser } from '@prisma/client';
import { User } from '../../domain/users/user.domain';
export declare class UsersMapper {
    toDomain(p: PrismaUser): User;
}
