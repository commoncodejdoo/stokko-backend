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
  lastLoginAt?: Date;
}

export abstract class UsersRepository {
  abstract create(input: CreateUserInput, tx?: TxClient): Promise<User>;
  abstract findById(id: string, tx?: TxClient): Promise<User | null>;
  abstract findByEmailInOrg(
    email: string,
    organizationId: string,
    tx?: TxClient,
  ): Promise<User | null>;
  /**
   * Finds every user with the given email across all organizations.
   * Used by the login flow — email is unique per-org but not globally,
   * so login must iterate matches and verify against each.
   */
  abstract findAllByEmail(email: string, tx?: TxClient): Promise<User[]>;
  abstract update(id: string, patch: UpdateUserInput, tx?: TxClient): Promise<User>;
  abstract listByOrg(organizationId: string, tx?: TxClient): Promise<User[]>;
}
