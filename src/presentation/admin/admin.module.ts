import { Module } from '@nestjs/common';
import { PrismaAdminUsersRepository } from '../../data/admin/admin-users.repository';
import { BcryptPasswordHasher } from '../../data/common/password-hasher';
import { AdminAuthService } from '../../domain/admin/admin-auth.service';
import { AdminOrgService } from '../../domain/admin/admin-org.service';
import { AdminStatsService } from '../../domain/admin/admin-stats.service';
import { AdminUsersRepository } from '../../domain/admin/admin-users.repository';
import { AdminUsersService } from '../../domain/admin/admin-users.service';
import { PasswordHasher } from '../../domain/common/password-hasher';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { AuthModule } from '../auth/auth.module';
import { CategoriesModule } from '../categories/categories.module';
import { OrganizationsModule } from '../organizations/organizations.module';
import { UsersModule } from '../users/users.module';
import { PlatformAdminGuard } from '../common/auth/platform-admin.guard';
import { AdminAuditController } from './admin-audit.controller';
import { AdminAuthController } from './admin-auth.controller';
import { AdminOrgsController } from './admin-orgs.controller';
import { AdminStatsController } from './admin-stats.controller';

@Module({
  imports: [
    AuditLogModule,
    AuthModule,
    OrganizationsModule,
    UsersModule,
    CategoriesModule,
  ],
  controllers: [
    AdminAuthController,
    AdminOrgsController,
    AdminStatsController,
    AdminAuditController,
  ],
  providers: [
    { provide: AdminUsersRepository, useClass: PrismaAdminUsersRepository },
    { provide: PasswordHasher, useClass: BcryptPasswordHasher },
    AdminUsersService,
    AdminAuthService,
    AdminOrgService,
    AdminStatsService,
    PlatformAdminGuard,
  ],
})
export class AdminModule {}
