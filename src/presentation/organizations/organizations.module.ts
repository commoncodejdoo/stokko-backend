import { Module } from '@nestjs/common';
import { PrismaOrganizationsRepository } from '../../data/organizations/organizations.repository';
import { OrganizationsRepository } from '../../domain/organizations/organizations.repository';
import { OrganizationsService } from '../../domain/organizations/organizations.service';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { OrganizationsController } from './organizations.controller';

@Module({
  imports: [AuditLogModule],
  controllers: [OrganizationsController],
  providers: [
    { provide: OrganizationsRepository, useClass: PrismaOrganizationsRepository },
    OrganizationsService,
  ],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
