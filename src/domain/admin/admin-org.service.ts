import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../data/common/prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CategoriesService } from '../categories/categories.service';
import { AuditAction } from '../common/audit-action';
import { DomainValidationError, EntityNotFoundError } from '../common/errors';
import { Role } from '../common/role';
import { JwtTokenService } from '../auth/jwt-token.service';
import { Organization } from '../organizations/organization.domain';
import { ListOrganizationsOptions, UpdateOrganizationInput } from '../organizations/organizations.repository';
import { OrganizationsService } from '../organizations/organizations.service';
import { User } from '../users/user.domain';
import { UsersService } from '../users/users.service';

export interface CreateOrgWithOwnerInput {
  name: string;
  currency?: string;
  ownerEmail: string;
  ownerFirstName: string;
  ownerLastName: string;
}

export type RiskLevel = 'healthy' | 'warning' | 'risk';

export interface OrgWithUserCount {
  org: Organization;
  userCount: number;
  /** Most recent activity (login OR audit-log entry). Null if none. */
  lastActivityAt: Date | null;
  /** Bucketed by `lastActivityAt`: <14d healthy, 14-30d warning, >30d (or null) risk. */
  riskLevel: RiskLevel;
}

export interface OrgWithUsers {
  org: Organization;
  users: User[];
}

export interface DailyActivityPoint {
  date: string; // YYYY-MM-DD (UTC)
  procurements: number;
  corrections: number;
  transfers: number;
}

export interface OrgActivity {
  procurementsCount: number;
  correctionsCount: number;
  transfersCount: number;
  shiftsCount: number;
  lastLoginAt: Date | null;
  lastActivityAt: Date | null;
  days: number;
  dailySeries: DailyActivityPoint[];
}

export interface ImpersonationSession {
  accessToken: string;
  expiresAt: Date;
  user: User;
  organization: Organization;
}

@Injectable()
export class AdminOrgService {
  constructor(
    private readonly orgsService: OrganizationsService,
    private readonly usersService: UsersService,
    private readonly categoriesService: CategoriesService,
    private readonly prisma: PrismaService,
    private readonly jwt: JwtTokenService,
    private readonly auditLog: AuditLogService,
  ) {}

  async listOrgs(
    opts: ListOrganizationsOptions,
  ): Promise<{ items: OrgWithUserCount[]; total: number }> {
    const [orgs, total] = await Promise.all([
      this.orgsService.listAll(opts),
      this.orgsService.countAll(opts.search),
    ]);
    const items = await Promise.all(
      orgs.map(async (org) => this.enrichOrg(org)),
    );
    return { items, total };
  }

  async getOrg(id: string): Promise<OrgWithUserCount> {
    const org = await this.orgsService.requireById(id);
    return this.enrichOrg(org);
  }

  private async enrichOrg(org: Organization): Promise<OrgWithUserCount> {
    const [userCount, lastAudit, lastLogin] = await Promise.all([
      this.orgsService.countUsers(org.id),
      this.prisma.auditLog.findFirst({
        where: { organizationId: org.id },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
      this.prisma.user.aggregate({
        where: { organizationId: org.id },
        _max: { lastLoginAt: true },
      }),
    ]);
    const candidates = [
      lastAudit?.createdAt ?? null,
      lastLogin._max.lastLoginAt ?? null,
    ].filter((d): d is Date => d !== null);
    const lastActivityAt = candidates.length
      ? new Date(Math.max(...candidates.map((d) => d.getTime())))
      : null;
    return {
      org,
      userCount,
      lastActivityAt,
      riskLevel: this.bucketRisk(lastActivityAt),
    };
  }

  private bucketRisk(lastActivityAt: Date | null): RiskLevel {
    if (!lastActivityAt) return 'risk';
    const ageMs = Date.now() - lastActivityAt.getTime();
    const days = ageMs / (1000 * 60 * 60 * 24);
    if (days < 14) return 'healthy';
    if (days < 30) return 'warning';
    return 'risk';
  }

  async getOrgActivity(id: string, days: number): Promise<OrgActivity> {
    const org = await this.orgsService.requireById(id);
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    cutoff.setUTCHours(0, 0, 0, 0); // align to UTC day for stable buckets

    const [procurements, corrections, transfers, shifts, userAgg, lastAudit] =
      await Promise.all([
        this.prisma.procurement.findMany({
          where: { organizationId: org.id, createdAt: { gte: cutoff } },
          select: { createdAt: true },
          orderBy: { createdAt: 'asc' },
        }),
        this.prisma.stockCorrection.findMany({
          where: { organizationId: org.id, createdAt: { gte: cutoff } },
          select: { createdAt: true },
          orderBy: { createdAt: 'asc' },
        }),
        this.prisma.stockTransfer.findMany({
          where: { organizationId: org.id, createdAt: { gte: cutoff } },
          select: { createdAt: true },
          orderBy: { createdAt: 'asc' },
        }),
        this.prisma.shift.count({
          where: { organizationId: org.id, openedAt: { gte: cutoff } },
        }),
        this.prisma.user.aggregate({
          where: { organizationId: org.id },
          _max: { lastLoginAt: true },
        }),
        this.prisma.auditLog.findFirst({
          where: { organizationId: org.id },
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true },
        }),
      ]);

    // Build daily buckets for the full window so empty days appear as zeros.
    const dailyMap = new Map<string, DailyActivityPoint>();
    for (let i = 0; i < days; i++) {
      const d = new Date(cutoff.getTime() + i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      dailyMap.set(key, { date: key, procurements: 0, corrections: 0, transfers: 0 });
    }
    const bump = (when: Date, kind: 'procurements' | 'corrections' | 'transfers') => {
      const key = when.toISOString().slice(0, 10);
      const slot = dailyMap.get(key);
      if (slot) slot[kind] += 1;
    };
    procurements.forEach((p) => bump(p.createdAt, 'procurements'));
    corrections.forEach((c) => bump(c.createdAt, 'corrections'));
    transfers.forEach((t) => bump(t.createdAt, 'transfers'));

    const lastLoginAt = userAgg._max.lastLoginAt ?? null;
    const candidates = [lastLoginAt, lastAudit?.createdAt ?? null].filter(
      (d): d is Date => d !== null,
    );
    const lastActivityAt = candidates.length
      ? new Date(Math.max(...candidates.map((d) => d.getTime())))
      : null;

    return {
      procurementsCount: procurements.length,
      correctionsCount: corrections.length,
      transfersCount: transfers.length,
      shiftsCount: shifts,
      lastLoginAt,
      lastActivityAt,
      days,
      dailySeries: Array.from(dailyMap.values()),
    };
  }

  async getOrgUsers(id: string): Promise<OrgWithUsers> {
    const org = await this.orgsService.requireById(id);
    const users = await this.usersService.listByOrg(id);
    return { org, users };
  }

  async createOrgWithOwner(
    input: CreateOrgWithOwnerInput,
  ): Promise<{ org: Organization; temporaryPassword: string }> {
    return this.prisma.$transaction(async (tx) => {
      const org = await this.orgsService.create(
        { name: input.name, currency: input.currency ?? 'EUR' },
        tx,
      );
      const invite = await this.usersService.invite(
        {
          organizationId: org.id,
          email: input.ownerEmail,
          firstName: input.ownerFirstName,
          lastName: input.ownerLastName,
          role: Role.OWNER,
        },
        null,
        tx,
      );
      await this.categoriesService.seedPredefined(org.id, invite.user.id, tx);
      return { org, temporaryPassword: invite.temporaryPassword };
    });
  }

  async updateOrg(id: string, patch: UpdateOrganizationInput): Promise<Organization> {
    await this.orgsService.requireById(id);
    return this.orgsService.update(id, patch);
  }

  /**
   * Issues a 1-hour access token for "View as Owner". Picks the oldest
   * active OWNER of the target org as the impersonated principal and
   * records an `ADMIN_IMPERSONATED` audit entry against that OWNER. The
   * session token carries `impersonatedBy: <adminId>` which causes
   * `AuditLogService.record()` to suppress any further audit entries for
   * actions performed during the session (until A6 introduces an
   * `AdminAuditLog` table that captures admin activity separately).
   */
  async createImpersonationSession(
    orgId: string,
    adminId: string,
  ): Promise<ImpersonationSession> {
    const org = await this.orgsService.requireById(orgId);
    if (!org.isActive) {
      throw new DomainValidationError(
        'Organization is deactivated — reactivate before impersonating',
        { orgId },
      );
    }
    const users = await this.usersService.listByOrg(orgId);
    const owner = users.find((u) => u.role === Role.OWNER && u.isActive);
    if (!owner) {
      throw new DomainValidationError(
        'No active Owner found for organization — cannot impersonate',
        { orgId },
      );
    }

    const { accessToken, expiresAt } = await this.jwt.issueImpersonationToken({
      userId: owner.id,
      organizationId: org.id,
      role: owner.role,
      adminId,
    });

    await this.auditLog.record({
      organizationId: org.id,
      userId: owner.id,
      action: AuditAction.ADMIN_IMPERSONATED,
      entityType: 'Organization',
      entityId: org.id,
      before: null,
      after: {
        impersonatedBy: adminId,
        expiresAt: expiresAt.toISOString(),
        ownerId: owner.id,
      },
    });

    return { accessToken, expiresAt, user: owner, organization: org };
  }

  async adminResetUserPassword(
    orgId: string,
    userId: string,
  ): Promise<{ user: User; temporaryPassword: string }> {
    await this.orgsService.requireById(orgId);
    const target = await this.usersService.requireInOrg(userId, orgId);
    return this.usersService.resetPassword(target.id, null);
  }

  async adminUpdateUser(
    orgId: string,
    userId: string,
    patch: { role?: Role; firstName?: string; lastName?: string; isActive?: boolean },
  ): Promise<User> {
    await this.orgsService.requireById(orgId);
    const target = await this.usersService.requireInOrg(userId, orgId);

    // isActive transitions go through deactivate/reactivate (last-owner guard).
    let updated: User = target;
    if (patch.isActive !== undefined && patch.isActive !== target.isActive) {
      updated = patch.isActive
        ? await this.usersService.reactivate(target.id, null)
        : await this.usersService.deactivate(target.id, null);
    }
    const profilePatch = {
      role: patch.role,
      firstName: patch.firstName,
      lastName: patch.lastName,
    };
    const hasProfileChange =
      profilePatch.role !== undefined ||
      profilePatch.firstName !== undefined ||
      profilePatch.lastName !== undefined;
    if (hasProfileChange) {
      updated = await this.usersService.updateProfile(target.id, profilePatch, null);
    }
    return updated;
  }

  async adminRequireUser(orgId: string, userId: string): Promise<User> {
    await this.orgsService.requireById(orgId);
    const user = await this.usersService.findById(userId);
    if (!user || user.organizationId !== orgId) {
      throw new EntityNotFoundError('User', userId);
    }
    return user;
  }
}
