import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../data/common/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AuditAction } from '../common/audit-action';
import { AuthContext } from '../common/auth-context';
import { CrossOrgAccessError, EntityNotFoundError } from '../common/errors';
import { Role } from '../common/role';
import { TxClient } from '../common/transaction';
import { UsersService } from '../users/users.service';
import { WarehousesService } from '../warehouses/warehouses.service';
import {
  UserWarehouseAccessRecord,
  UserWarehouseAccessRepository,
} from './user-warehouse-access.repository';

@Injectable()
export class UserWarehouseAccessService {
  constructor(
    private readonly repo: UserWarehouseAccessRepository,
    private readonly users: UsersService,
    private readonly warehouses: WarehousesService,
    private readonly auditLog: AuditLogService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Returns warehouse IDs a user has access to. OWNER and ADMIN bypass the
   * scoping table (they see everything in their org) — for them this method
   * returns all non-deleted warehouse IDs. EMPLOYEE returns rows from the
   * access table.
   */
  async allowedWarehouseIdsForCtx(ctx: AuthContext, tx?: TxClient): Promise<string[]> {
    if (ctx.role !== Role.EMPLOYEE) {
      const all = await this.warehouses.list(ctx.organizationId, tx);
      return all.map((w) => w.id);
    }
    const rows = await this.repo.listForUser(ctx.userId, tx);
    return rows.map((r) => r.warehouseId);
  }

  /**
   * Throws if `ctx.role === EMPLOYEE` and the warehouse is not in their
   * allowed set. OWNER/ADMIN are unaffected (return immediately).
   */
  async requireAccessForCtx(
    ctx: AuthContext,
    warehouseId: string,
    tx?: TxClient,
  ): Promise<void> {
    if (ctx.role !== Role.EMPLOYEE) return;
    const allowed = await this.allowedWarehouseIdsForCtx(ctx, tx);
    if (!allowed.includes(warehouseId)) {
      throw new CrossOrgAccessError('Warehouse', warehouseId);
    }
  }

  async listForUser(
    userId: string,
    organizationId: string,
    tx?: TxClient,
  ): Promise<UserWarehouseAccessRecord[]> {
    const user = await this.users.findById(userId, tx);
    if (!user) throw new EntityNotFoundError('User', userId);
    if (user.organizationId !== organizationId) {
      throw new CrossOrgAccessError('User', userId);
    }
    return this.repo.listForUser(userId, tx);
  }

  async listForWarehouse(
    warehouseId: string,
    organizationId: string,
    tx?: TxClient,
  ): Promise<UserWarehouseAccessRecord[]> {
    await this.warehouses.requireById(warehouseId, organizationId, tx);
    return this.repo.listForWarehouse(warehouseId, tx);
  }

  /**
   * Replaces the full set of warehouses a user has access to with the given
   * list. Computes delta and emits audit events for each granted/revoked
   * warehouse. Idempotent — calling with the same list is a no-op.
   */
  async replaceForUser(
    userId: string,
    warehouseIds: string[],
    ctx: AuthContext,
  ): Promise<UserWarehouseAccessRecord[]> {
    const user = await this.users.findById(userId);
    if (!user) throw new EntityNotFoundError('User', userId);
    if (user.organizationId !== ctx.organizationId) {
      throw new CrossOrgAccessError('User', userId);
    }
    for (const wid of warehouseIds) {
      await this.warehouses.requireById(wid, ctx.organizationId);
    }

    return this.prisma.$transaction(async (tx) => {
      const current = await this.repo.listForUser(userId, tx);
      const currentSet = new Set(current.map((r) => r.warehouseId));
      const targetSet = new Set(warehouseIds);

      const toGrant = warehouseIds.filter((id) => !currentSet.has(id));
      const toRevoke = current.filter((r) => !targetSet.has(r.warehouseId));

      for (const wid of toGrant) {
        await this.repo.grant(userId, wid, tx);
        await this.auditLog.record(
          {
            organizationId: ctx.organizationId,
            userId: ctx.userId,
            action: AuditAction.USER_WAREHOUSE_ACCESS_GRANTED,
            entityType: 'UserWarehouseAccess',
            entityId: `${userId}:${wid}`,
            before: null,
            after: { userId, warehouseId: wid },
          },
          tx,
        );
      }

      for (const r of toRevoke) {
        await this.repo.revoke(userId, r.warehouseId, tx);
        await this.auditLog.record(
          {
            organizationId: ctx.organizationId,
            userId: ctx.userId,
            action: AuditAction.USER_WAREHOUSE_ACCESS_REVOKED,
            entityType: 'UserWarehouseAccess',
            entityId: `${userId}:${r.warehouseId}`,
            before: { userId, warehouseId: r.warehouseId },
            after: null,
          },
          tx,
        );
      }

      return this.repo.listForUser(userId, tx);
    });
  }

  /**
   * Replaces the full set of users with access to a warehouse. Inverse of
   * `replaceForUser` — same semantics, different axis.
   */
  async replaceForWarehouse(
    warehouseId: string,
    userIds: string[],
    ctx: AuthContext,
  ): Promise<UserWarehouseAccessRecord[]> {
    await this.warehouses.requireById(warehouseId, ctx.organizationId);
    for (const uid of userIds) {
      const u = await this.users.findById(uid);
      if (!u) throw new EntityNotFoundError('User', uid);
      if (u.organizationId !== ctx.organizationId) {
        throw new CrossOrgAccessError('User', uid);
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const current = await this.repo.listForWarehouse(warehouseId, tx);
      const currentSet = new Set(current.map((r) => r.userId));
      const targetSet = new Set(userIds);

      const toGrant = userIds.filter((id) => !currentSet.has(id));
      const toRevoke = current.filter((r) => !targetSet.has(r.userId));

      for (const uid of toGrant) {
        await this.repo.grant(uid, warehouseId, tx);
        await this.auditLog.record(
          {
            organizationId: ctx.organizationId,
            userId: ctx.userId,
            action: AuditAction.USER_WAREHOUSE_ACCESS_GRANTED,
            entityType: 'UserWarehouseAccess',
            entityId: `${uid}:${warehouseId}`,
            before: null,
            after: { userId: uid, warehouseId },
          },
          tx,
        );
      }

      for (const r of toRevoke) {
        await this.repo.revoke(r.userId, warehouseId, tx);
        await this.auditLog.record(
          {
            organizationId: ctx.organizationId,
            userId: ctx.userId,
            action: AuditAction.USER_WAREHOUSE_ACCESS_REVOKED,
            entityType: 'UserWarehouseAccess',
            entityId: `${r.userId}:${warehouseId}`,
            before: { userId: r.userId, warehouseId },
            after: null,
          },
          tx,
        );
      }

      return this.repo.listForWarehouse(warehouseId, tx);
    });
  }
}
