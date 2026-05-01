import { Organization as PrismaOrganization } from '@prisma/client';
import { Organization } from '../../domain/organizations/organization.domain';
export declare class OrganizationsMapper {
    toDomain(p: PrismaOrganization): Organization;
}
