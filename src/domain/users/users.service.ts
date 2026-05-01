import { Injectable } from '@nestjs/common';
import { AuditAction } from '../common/audit-action';
import { EntityNotFoundError } from '../common/errors';
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
  /** Plaintext temporary password — only returned to the inviting Owner. */
  temporaryPassword: string;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly repo: UsersRepository,
    private readonly hasher: PasswordHasher,
    private readonly auditLog: AuditLogService,
  ) {}

  async findById(id: string, tx?: TxClient): Promise<User | null> {
    return this.repo.findById(id, tx);
  }

  async requireById(id: string, tx?: TxClient): Promise<User> {
    const user = await this.repo.findById(id, tx);
    if (!user) throw new EntityNotFoundError('User', id);
    return user;
  }

  async findByEmailInOrg(
    email: string,
    organizationId: string,
    tx?: TxClient,
  ): Promise<User | null> {
    return this.repo.findByEmailInOrg(email, organizationId, tx);
  }

  async findAllByEmail(email: string, tx?: TxClient): Promise<User[]> {
    return this.repo.findAllByEmail(email, tx);
  }

  /**
   * Creates a user with a freshly generated temporary password.
   * Caller (Owner or super-admin CLI) receives the plaintext via the
   * return value and is responsible for delivering it to the new user.
   *
   * `actorUserId` is the user who triggered the creation. Pass `null`
   * for the bootstrap case (very first Owner of a new organization) —
   * the audit log will then record the new user as their own actor.
   */
  async invite(
    input: InviteUserInput,
    actorUserId: string | null,
    tx?: TxClient,
  ): Promise<InviteUserResult> {
    const temporaryPassword = this.hasher.generateTemporary();
    const passwordHash = await this.hasher.hash(temporaryPassword);

    const user = await this.repo.create(
      {
        ...input,
        passwordHash,
        mustChangePassword: true,
      },
      tx,
    );

    await this.auditLog.record(
      {
        organizationId: user.organizationId,
        userId: actorUserId ?? user.id,
        action: AuditAction.USER_INVITED,
        entityType: 'User',
        entityId: user.id,
        before: null,
        after: user.toSnapshot(),
      },
      tx,
    );

    return { user, temporaryPassword };
  }

  /**
   * Persists a new password hash for a user and clears the
   * `mustChangePassword` flag.
   */
  async setPassword(
    userId: string,
    newPasswordHash: string,
    actorUserId: string,
    tx?: TxClient,
  ): Promise<User> {
    const before = await this.requireById(userId, tx);
    const after = await this.repo.update(
      userId,
      { passwordHash: newPasswordHash, mustChangePassword: false },
      tx,
    );
    await this.auditLog.record(
      {
        organizationId: before.organizationId,
        userId: actorUserId,
        action: AuditAction.USER_PASSWORD_CHANGED,
        entityType: 'User',
        entityId: userId,
        before: before.toSnapshot(),
        after: after.toSnapshot(),
      },
      tx,
    );
    return after;
  }
}
