import { Module } from '@nestjs/common';
import { BcryptPasswordHasher } from '../../data/common/password-hasher';
import { PrismaUsersRepository } from '../../data/users/users.repository';
import { PasswordHasher } from '../../domain/common/password-hasher';
import { UsersRepository } from '../../domain/users/users.repository';
import { UsersService } from '../../domain/users/users.service';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { UsersController } from './users.controller';
import { UsersManagementController } from './users-management.controller';

@Module({
  imports: [AuditLogModule, OrganizationsModule],
  controllers: [UsersController, UsersManagementController],
  providers: [
    { provide: UsersRepository, useClass: PrismaUsersRepository },
    { provide: PasswordHasher, useClass: BcryptPasswordHasher },
    UsersService,
  ],
  exports: [UsersService, PasswordHasher],
})
export class UsersModule {}
