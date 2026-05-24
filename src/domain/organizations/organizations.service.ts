import { Injectable } from '@nestjs/common';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AuditAction } from '../common/audit-action';
import { AuthContext } from '../common/auth-context';
import { EntityNotFoundError } from '../common/errors';
import { TxClient } from '../common/transaction';
import { PrismaService } from '../../data/common/prisma/prisma.service';
import { Organization } from './organization.domain';
import {
  CreateOrganizationInput,
  ListOrganizationsOptions,
  OrganizationsRepository,
  UpdateOrganizationInput,
} from './organizations.repository';

export interface UpdateOrgSettingsCommand {
  priceTrackingEnabled?: boolean;
}

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly repo: OrganizationsRepository,
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async create(input: CreateOrganizationInput, tx?: TxClient): Promise<Organization> {
    return this.repo.create(input, tx);
  }

  async findById(id: string, tx?: TxClient): Promise<Organization | null> {
    return this.repo.findById(id, tx);
  }

  async requireById(id: string, tx?: TxClient): Promise<Organization> {
    const org = await this.repo.findById(id, tx);
    if (!org) throw new EntityNotFoundError('Organization', id);
    return org;
  }

  async listAll(opts: ListOrganizationsOptions): Promise<Organization[]> {
    return this.repo.listAll(opts);
  }

  async countAll(search?: string): Promise<number> {
    return this.repo.countAll(search);
  }

  async update(id: string, patch: UpdateOrganizationInput): Promise<Organization> {
    return this.repo.update(id, patch);
  }

  async countUsers(id: string): Promise<number> {
    return this.repo.countUsers(id);
  }

  /**
   * Owner-only org settings update. Runs in a transaction with an audit log entry.
   * Currently only `priceTrackingEnabled` is exposed; the same method will host
   * future per-org settings (currency, lead-time defaults, etc.).
   */
  async updateSettings(
    organizationId: string,
    cmd: UpdateOrgSettingsCommand,
    ctx: AuthContext,
  ): Promise<Organization> {
    return this.prisma.$transaction(async (tx) => {
      const before = await this.requireById(organizationId, tx);
      const patch: UpdateOrganizationInput = {};
      if (cmd.priceTrackingEnabled !== undefined) {
        patch.priceTrackingEnabled = cmd.priceTrackingEnabled;
      }
      const updated = await this.repo.update(organizationId, patch, tx);
      await this.auditLog.record(
        {
          organizationId,
          userId: ctx.userId,
          action: AuditAction.ORGANIZATION_SETTINGS_UPDATED,
          entityType: 'Organization',
          entityId: organizationId,
          before: before.toSnapshot(),
          after: updated.toSnapshot(),
        },
        tx,
      );
      return updated;
    });
  }
}
