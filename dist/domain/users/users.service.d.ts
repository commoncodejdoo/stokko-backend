import { PasswordHasher } from '../common/password-hasher';
import { Role } from '../common/role';
import { TxClient } from '../common/transaction';
import { AuditLogService } from '../audit-log/audit-log.service';
import { User } from './user.domain';
import { UsersRepository } from './users.repository';
export interface InviteUserInput {
    organizationId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
}
export interface InviteUserResult {
    user: User;
    temporaryPassword: string;
}
export declare class UsersService {
    private readonly repo;
    private readonly hasher;
    private readonly auditLog;
    constructor(repo: UsersRepository, hasher: PasswordHasher, auditLog: AuditLogService);
    findById(id: string, tx?: TxClient): Promise<User | null>;
    requireById(id: string, tx?: TxClient): Promise<User>;
    findByEmailInOrg(email: string, organizationId: string, tx?: TxClient): Promise<User | null>;
    findAllByEmail(email: string, tx?: TxClient): Promise<User[]>;
    invite(input: InviteUserInput, actorUserId: string | null, tx?: TxClient): Promise<InviteUserResult>;
    setPassword(userId: string, newPasswordHash: string, actorUserId: string, tx?: TxClient): Promise<User>;
}
