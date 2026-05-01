import { Organization } from '../../domain/organizations/organization.domain';
import { CreateOrganizationInput, OrganizationsRepository } from '../../domain/organizations/organizations.repository';
import { TxClient } from '../../domain/common/transaction';
import { PrismaService } from '../common/prisma/prisma.service';
export declare class PrismaOrganizationsRepository extends OrganizationsRepository {
    private readonly prisma;
    private readonly mapper;
    constructor(prisma: PrismaService);
    private client;
    create(input: CreateOrganizationInput, tx?: TxClient): Promise<Organization>;
    findById(id: string, tx?: TxClient): Promise<Organization | null>;
}
