import { TxClient } from '../common/transaction';
import { Organization } from './organization.domain';
export interface CreateOrganizationInput {
    name: string;
    currency?: string;
}
export declare abstract class OrganizationsRepository {
    abstract create(input: CreateOrganizationInput, tx?: TxClient): Promise<Organization>;
    abstract findById(id: string, tx?: TxClient): Promise<Organization | null>;
}
