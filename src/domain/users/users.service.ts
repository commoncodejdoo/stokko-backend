import { Injectable } from '@nestjs/common';
import { AuditAction } from '../common/audit-action';
import {
  CrossOrgAccessError,
  DomainValidationError,
  EntityNotFoundError,
} from '../common/errors';
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

  async listByOrg(organizationId: string, tx?: TxClient): Promise<User[]> {
    return this.repo.listByOrg(organizationId, tx);
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

  /**
   * Cross-org-safe lookup. Use from controllers that take `:id` and need
   * to confirm the target user belongs to the caller's org.
   */
  async requireInOrg(
    userId: string,
    organizationId: string,
    tx?: TxClient,
  ): Promise<User> {
    const user = await this.requireById(userId, tx);
    if (user.organizationId !== organizationId) {
      throw new CrossOrgAccessError('User', userId);
    }
    return user;
  }

  /**
   * Patch profile fields (firstName/lastName) and/or change role.
   * Used by Owner-only management endpoints.
   *
   * Records `USER_ROLE_CHANGED` only when the role actually changes; field
   * edits without a role change still produce a sensible audit entry via
   * the same action — the before/after snapshots tell the full story.
   */
  async updateProfile(
    userId: string,
    patch: { firstName?: string; lastName?: string; role?: Role },
    actorUserId: string,
    tx?: TxClient,
  ): Promise<User> {
    const before = await this.requireById(userId, tx);

    // Last-Owner protection — there must always be at least one active OWNER.
    if (
      before.role === Role.OWNER &&
      patch.role !== undefined &&
      patch.role !== Role.OWNER
    ) {
      const allOwners = (await this.repo.listByOrg(before.organizationId, tx)).filter(
        (u) => u.role === Role.OWNER && u.isActive,
      );
      if (allOwners.length <= 1) {
        throw new DomainValidationError(
          'Cannot demote the last active Owner of the organization',
          { userId },
        );
      }
    }

    const after = await this.repo.update(
      userId,
      {
        firstName: patch.firstName,
        lastName: patch.lastName,
        role: patch.role,
      },
      tx,
    );

    if (patch.role !== undefined && patch.role !== before.role) {
      await this.auditLog.record(
        {
          organizationId: before.organizationId,
          userId: actorUserId,
          action: AuditAction.USER_ROLE_CHANGED,
          entityType: 'User',
          entityId: userId,
          before: before.toSnapshot(),
          after: after.toSnapshot(),
        },
        tx,
      );
    }
    return after;
  }

  async deactivate(
    userId: string,
    actorUserId: string,
    tx?: TxClient,
  ): Promise<User> {
    const before = await this.requireById(userId, tx);
    if (!before.isActive) return before;

    if (before.id === actorUserId) {
      throw new DomainValidationError('You cannot deactivate your own account');
    }

    if (before.role === Role.OWNER) {
      const activeOwners = (await this.repo.listByOrg(before.organizationId, tx))
        .filter((u) => u.role === Role.OWNER && u.isActive);
      if (activeOwners.length <= 1) {
        throw new DomainValidationError(
          'Cannot deactivate the last active Owner of the organization',
          { userId },
        );
      }
    }

    const after = await this.repo.update(userId, { isActive: false }, tx);
    await this.auditLog.record(
      {
        organizationId: before.organizationId,
        userId: actorUserId,
        action: AuditAction.USER_DEACTIVATED,
        entityType: 'User',
        entityId: userId,
        before: before.toSnapshot(),
        after: after.toSnapshot(),
      },
      tx,
    );
    return after;
  }

  async reactivate(
    userId: string,
    actorUserId: string,
    tx?: TxClient,
  ): Promise<User> {
    const before = await this.requireById(userId, tx);
    if (before.isActive) return before;
    const after = await this.repo.update(userId, { isActive: true }, tx);
    await this.auditLog.record(
      {
        organizationId: before.organizationId,
        userId: actorUserId,
        action: AuditAction.USER_REACTIVATED,
        entityType: 'User',
        entityId: userId,
        before: before.toSnapshot(),
        after: after.toSnapshot(),
      },
      tx,
    );
    return after;
  }

  /**
   * Owner-only — generates a fresh temporary password, persists its hash,
   * sets `mustChangePassword=true`, and returns the plaintext for the
   * Owner to deliver to the user. Records `USER_PASSWORD_RESET`.
   */
  async resetPassword(
    userId: string,
    actorUserId: string,
    tx?: TxClient,
  ): Promise<{ user: User; temporaryPassword: string }> {
    const before = await this.requireById(userId, tx);
    const temporaryPassword = this.hasher.generateTemporary();
    const passwordHash = await this.hasher.hash(temporaryPassword);
    const after = await this.repo.update(
      userId,
      { passwordHash, mustChangePassword: true },
      tx,
    );
    await this.auditLog.record(
      {
        organizationId: before.organizationId,
        userId: actorUserId,
        action: AuditAction.USER_PASSWORD_RESET,
        entityType: 'User',
        entityId: userId,
        before: before.toSnapshot(),
        after: after.toSnapshot(),
      },
      tx,
    );
    return { user: after, temporaryPassword };
  }
}
