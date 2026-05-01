import { Organization as PrismaOrganization } from '@prisma/client';
import { Organization } from '../../domain/organizations/organization.domain';

export class OrganizationsMapper {
  toDomain(p: PrismaOrganization): Organization {
    return new Organization(p.id, p.name, p.currency, p.isActive, p.createdAt, p.updatedAt);
  }
}
