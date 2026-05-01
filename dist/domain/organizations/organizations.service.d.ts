import { TxClient } from '../common/transaction';
import { Organization } from './organization.domain';
import { CreateOrganizationInput, OrganizationsRepository } from './organizations.repository';
export declare class OrganizationsService {
    private readonly repo;
    constructor(repo: OrganizationsRepository);
    create(input: CreateOrganizationInput, tx?: TxClient): Promise<Organization>;
    findById(id: string, tx?: TxClient): Promise<Organization | null>;
    requireById(id: string, tx?: TxClient): Promise<Organization>;
}
