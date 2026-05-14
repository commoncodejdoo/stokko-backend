import { Injectable } from '@nestjs/common';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AuditAction } from '../common/audit-action';
import { AuthContext } from '../common/auth-context';
import { CrossOrgAccessError, EntityNotFoundError } from '../common/errors';
import { PREDEFINED_CATEGORIES } from '../common/predefined-categories';
import { TxClient } from '../common/transaction';
import { Category } from './category.domain';
import { CategoriesRepository, UpdateCategoryInput } from './categories.repository';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly repo: CategoriesRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async list(organizationId: string, tx?: TxClient): Promise<Category[]> {
    return this.repo.listByOrg(organizationId, tx);
  }

  async findById(id: string, tx?: TxClient): Promise<Category | null> {
    return this.repo.findById(id, tx);
  }

  async findByName(
    name: string,
    organizationId: string,
    tx?: TxClient,
  ): Promise<Category | null> {
    return this.repo.findByName(organizationId, name, tx);
  }

  async requireById(id: string, organizationId: string, tx?: TxClient): Promise<Category> {
    const cat = await this.repo.findById(id, tx);
    if (!cat || cat.isDeleted()) throw new EntityNotFoundError('Category', id);
    if (cat.organizationId !== organizationId) {
      throw new CrossOrgAccessError('Category', id);
    }
    return cat;
  }

  async create(name: string, ctx: AuthContext, tx?: TxClient): Promise<Category> {
    const created = await this.repo.create(
      { organizationId: ctx.organizationId, name, isPredefined: false },
      tx,
    );
    await this.auditLog.record(
      {
        organizationId: ctx.organizationId,
        userId: ctx.userId,
        action: AuditAction.CATEGORY_CREATED,
        entityType: 'Category',
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
    patch: UpdateCategoryInput,
    ctx: AuthContext,
    tx?: TxClient,
  ): Promise<Category> {
    const before = await this.requireById(id, ctx.organizationId, tx);
    const updated = await this.repo.update(id, patch, tx);
    await this.auditLog.record(
      {
        organizationId: ctx.organizationId,
        userId: ctx.userId,
        action: AuditAction.CATEGORY_UPDATED,
        entityType: 'Category',
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
        action: AuditAction.CATEGORY_DELETED,
        entityType: 'Category',
        entityId: deleted.id,
        before: before.toSnapshot(),
        after: deleted.toSnapshot(),
      },
      tx,
    );
  }

  /**
   * Bootstraps the predefined category set for a freshly created organization.
   * Called from `OrganizationsService.create` inside the same transaction.
   * The actor for the audit log is the new owner (passed in by the caller).
   */
  async seedPredefined(
    organizationId: string,
    actorUserId: string,
    tx: TxClient,
  ): Promise<Category[]> {
    const created: Category[] = [];
    for (const name of PREDEFINED_CATEGORIES) {
      const cat = await this.repo.create(
        { organizationId, name, isPredefined: true },
        tx,
      );
      created.push(cat);
      await this.auditLog.record(
        {
          organizationId,
          userId: actorUserId,
          action: AuditAction.CATEGORY_CREATED,
          entityType: 'Category',
          entityId: cat.id,
          before: null,
          after: cat.toSnapshot(),
        },
        tx,
      );
    }
    return created;
  }
}
