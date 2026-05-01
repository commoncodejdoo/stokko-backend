import { TxClient } from '../../domain/common/transaction';
import { User } from '../../domain/users/user.domain';
import { CreateUserInput, UpdateUserInput, UsersRepository } from '../../domain/users/users.repository';
import { PrismaService } from '../common/prisma/prisma.service';
export declare class PrismaUsersRepository extends UsersRepository {
    private readonly prisma;
    private readonly mapper;
    constructor(prisma: PrismaService);
    private client;
    create(input: CreateUserInput, tx?: TxClient): Promise<User>;
    findById(id: string, tx?: TxClient): Promise<User | null>;
    findByEmailInOrg(email: string, organizationId: string, tx?: TxClient): Promise<User | null>;
    findAllByEmail(email: string, tx?: TxClient): Promise<User[]>;
    update(id: string, patch: UpdateUserInput, tx?: TxClient): Promise<User>;
    listByOrg(organizationId: string, tx?: TxClient): Promise<User[]>;
}
