import { Injectable } from '@nestjs/common';
import { EntityNotFoundError } from '../common/errors';
import { TxClient } from '../common/transaction';
import { Organization } from './organization.domain';
import {
  CreateOrganizationInput,
  ListOrganizationsOptions,
  OrganizationsRepository,
  UpdateOrganizationInput,
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
}
