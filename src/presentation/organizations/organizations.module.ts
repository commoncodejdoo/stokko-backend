import { Module } from '@nestjs/common';
import { PrismaOrganizationsRepository } from '../../data/organizations/organizations.repository';
import { OrganizationsRepository } from '../../domain/organizations/organizations.repository';
import { OrganizationsService } from '../../domain/organizations/organizations.service';

@Module({
  providers: [
    { provide: OrganizationsRepository, useClass: PrismaOrganizationsRepository },
    OrganizationsService,
  ],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
