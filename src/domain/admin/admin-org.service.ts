import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../data/common/prisma/prisma.service';
import { CategoriesService } from '../categories/categories.service';
import { Role } from '../common/role';
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

export interface OrgWithUserCount {
  org: Organization;
  userCount: number;
}

export interface OrgWithUsers {
  org: Organization;
  users: User[];
}

@Injectable()
export class AdminOrgService {
  constructor(
    private readonly orgsService: OrganizationsService,
    private readonly usersService: UsersService,
    private readonly categoriesService: CategoriesService,
    private readonly prisma: PrismaService,
  ) {}

  async listOrgs(
    opts: ListOrganizationsOptions,
  ): Promise<{ items: OrgWithUserCount[]; total: number }> {
    const [orgs, total] = await Promise.all([
      this.orgsService.listAll(opts),
      this.orgsService.countAll(opts.search),
    ]);
    const items = await Promise.all(
      orgs.map(async (org) => ({
        org,
        userCount: await this.orgsService.countUsers(org.id),
      })),
    );
    return { items, total };
  }

  async getOrg(id: string): Promise<OrgWithUserCount> {
    const org = await this.orgsService.requireById(id);
    const userCount = await this.orgsService.countUsers(id);
    return { org, userCount };
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
}
