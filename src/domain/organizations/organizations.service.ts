import { Injectable } from '@nestjs/common';
import { EntityNotFoundError } from '../common/errors';
import { TxClient } from '../common/transaction';
import { Organization } from './organization.domain';
import {
  CreateOrganizationInput,
  OrganizationsRepository,
} from './organizations.repository';

@Injectable()
export class OrganizationsService {
  constructor(private readonly repo: OrganizationsRepository) {}

  async create(input: CreateOrganizationInput, tx?: TxClient): Promise<Organization> {
    return this.repo.create(input, tx);
  }

  async findById(id: string, tx?: TxClient): Promise<Organization | null> {
    return this.repo.findById(id, tx);
  }

  /** Throws `EntityNotFoundError` if the org doesn't exist. */
  async requireById(id: string, tx?: TxClient): Promise<Organization> {
    const org = await this.repo.findById(id, tx);
    if (!org) throw new EntityNotFoundError('Organization', id);
    return org;
  }
}
