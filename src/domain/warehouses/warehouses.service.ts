import { Injectable } from '@nestjs/common';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AuditAction } from '../common/audit-action';
import { AuthContext } from '../common/auth-context';
import { CrossOrgAccessError, EntityNotFoundError } from '../common/errors';
import { TxClient } from '../common/transaction';
import { Warehouse, WarehouseKind } from './warehouse.domain';
import {
  UpdateWarehouseInput,
  WarehousesRepository,
} from './warehouses.repository';

@Injectable()
export class WarehousesService {
  constructor(
    private readonly repo: WarehousesRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async list(organizationId: string, tx?: TxClient): Promise<Warehouse[]> {
    return this.repo.listByOrg(organizationId, tx);
  }

  async findById(id: string, tx?: TxClient): Promise<Warehouse | null> {
    return this.repo.findById(id, tx);
  }

  async findByName(
    name: string,
    organizationId: string,
    tx?: TxClient,
  ): Promise<Warehouse | null> {
    return this.repo.findByName(organizationId, name, tx);
  }

  async requireById(id: string, organizationId: string, tx?: TxClient): Promise<Warehouse> {
    const wh = await this.repo.findById(id, tx);
    if (!wh || wh.isDeleted()) throw new EntityNotFoundError('Warehouse', id);
    if (wh.organizationId !== organizationId) {
      throw new CrossOrgAccessError('Warehouse', id);
    }
    return wh;
  }

  async create(
    input: { name: string; color: string; kind?: WarehouseKind },
    ctx: AuthContext,
    tx?: TxClient,
  ): Promise<Warehouse> {
    const created = await this.repo.create(
      { organizationId: ctx.organizationId, ...input },
      tx,
    );
    await this.auditLog.record(
      {
        organizationId: ctx.organizationId,
        userId: ctx.userId,
        action: AuditAction.WAREHOUSE_CREATED,
        entityType: 'Warehouse',
        entityId: created.id,
        before: null,
        after: created.toSnapshot(),
      },
      tx,
    );
    return created;
  }

  async update(
    id: string,
    patch: UpdateWarehouseInput,
    ctx: AuthContext,
    tx?: TxClient,
  ): Promise<Warehouse> {
    const before = await this.requireById(id, ctx.organizationId, tx);
    const updated = await this.repo.update(id, patch, tx);
    await this.auditLog.record(
      {
        organizationId: ctx.organizationId,
        userId: ctx.userId,
        action: AuditAction.WAREHOUSE_UPDATED,
        entityType: 'Warehouse',
        entityId: updated.id,
        before: before.toSnapshot(),
        after: updated.toSnapshot(),
      },
      tx,
    );
    return updated;
  }

  async softDelete(id: string, ctx: AuthContext, tx?: TxClient): Promise<void> {
    const before = await this.requireById(id, ctx.organizationId, tx);
    const deleted = await this.repo.softDelete(id, tx);
    await this.auditLog.record(
      {
        organizationId: ctx.organizationId,
        userId: ctx.userId,
        action: AuditAction.WAREHOUSE_DELETED,
        entityType: 'Warehouse',
        entityId: deleted.id,
        before: before.toSnapshot(),
        after: deleted.toSnapshot(),
      },
      tx,
    );
  }
}
