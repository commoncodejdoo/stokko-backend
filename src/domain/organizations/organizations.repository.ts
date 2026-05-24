import { TxClient } from '../common/transaction';
import { Organization } from './organization.domain';

export interface CreateOrganizationInput {
  name: string;
  currency?: string;
}

export interface UpdateOrganizationInput {
  name?: string;
  currency?: string;
  isActive?: boolean;
  priceTrackingEnabled?: boolean;
}

export interface ListOrganizationsOptions {
  search?: string;
  skip: number;
  take: number;
}

export abstract class OrganizationsRepository {
  abstract create(input: CreateOrganizationInput, tx?: TxClient): Promise<Organization>;
  abstract findById(id: string, tx?: TxClient): Promise<Organization | null>;
  abstract listAll(opts: ListOrganizationsOptions, tx?: TxClient): Promise<Organization[]>;
  abstract countAll(search?: string, tx?: TxClient): Promise<number>;
  abstract update(id: string, patch: UpdateOrganizationInput, tx?: TxClient): Promise<Organization>;
  abstract countUsers(id: string, tx?: TxClient): Promise<number>;
}
