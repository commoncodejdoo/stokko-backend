import { Injectable } from '@nestjs/common';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AuditAction } from '../common/audit-action';
import { AuthContext } from '../common/auth-context';
import { CrossOrgAccessError, EntityNotFoundError } from '../common/errors';
import { TxClient } from '../common/transaction';
import { Supplier } from './supplier.domain';
import {
  SuppliersRepository,
  UpdateSupplierInput,
} from './suppliers.repository';

export interface CreateSupplierCommand {
  name: string;
  contactPerson?: string | null;
  phone?: string | null;
  email?: string | null;
  note?: string | null;
}

@Injectable()
export class SuppliersService {
  constructor(
    private readonly repo: SuppliersRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async findById(id: string, tx?: TxClient): Promise<Supplier | null> {
    return this.repo.findById(id, tx);
  }

  async requireById(id: string, organizationId: string, tx?: TxClient): Promise<Supplier> {
    const s = await this.repo.findById(id, tx);
    if (!s || s.isDeleted()) throw new EntityNotFoundError('Supplier', id);
    if (s.organizationId !== organizationId) {
      throw new CrossOrgAccessError('Supplier', id);
    }
    return s;
  }

  async list(organizationId: string, tx?: TxClient): Promise<Supplier[]> {
    return this.repo.listByOrg(organizationId, tx);
  }

  async create(
    cmd: CreateSupplierCommand,
    ctx: AuthContext,
    tx?: TxClient,
  ): Promise<Supplier> {
    const created = await this.repo.create(
      { organizationId: ctx.organizationId, ...cmd },
      tx,
    );
    await this.auditLog.record(
      {
        organizationId: ctx.organizationId,
        userId: ctx.userId,
        action: AuditAction.SUPPLIER_CREATED,
        entityType: 'Supplier',
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
    patch: UpdateSupplierInput,
    ctx: AuthContext,
    tx?: TxClient,
  ): Promise<Supplier> {
    const before = await this.requireById(id, ctx.organizationId, tx);
    const updated = await this.repo.update(id, patch, tx);
    await this.auditLog.record(
      {
        organizationId: ctx.organizationId,
        userId: ctx.userId,
        action: AuditAction.SUPPLIER_UPDATED,
        entityType: 'Supplier',
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
        action: AuditAction.SUPPLIER_DELETED,
        entityType: 'Supplier',
        entityId: deleted.id,
        before: before.toSnapshot(),
        after: deleted.toSnapshot(),
      },
      tx,
    );
  }
}
