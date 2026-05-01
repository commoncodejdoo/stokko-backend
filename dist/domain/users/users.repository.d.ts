import { Role } from '../common/role';
import { TxClient } from '../common/transaction';
import { User } from './user.domain';
export interface CreateUserInput {
    organizationId: string;
    email: string;
    passwordHash: string;
    role: Role;
    firstName: string;
    lastName: string;
    mustChangePassword?: boolean;
}
export interface UpdateUserInput {
    role?: Role;
    firstName?: string;
    lastName?: string;
    mustChangePassword?: boolean;
    passwordHash?: string;
    isActive?: boolean;
}
export declare abstract class UsersRepository {
    abstract create(input: CreateUserInput, tx?: TxClient): Promise<User>;
    abstract findById(id: string, tx?: TxClient): Promise<User | null>;
    abstract findByEmailInOrg(email: string, organizationId: string, tx?: TxClient): Promise<User | null>;
    abstract findAllByEmail(email: string, tx?: TxClient): Promise<User[]>;
    abstract update(id: string, patch: UpdateUserInput, tx?: TxClient): Promise<User>;
    abstract listByOrg(organizationId: string, tx?: TxClient): Promise<User[]>;
}
