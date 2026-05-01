import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './data/common/prisma/prisma.module';
import { AuditLogModule } from './presentation/audit-log/audit-log.module';
import { AuthModule } from './presentation/auth/auth.module';
import { HealthModule } from './presentation/common/health/health.module';
import { OrganizationsModule } from './presentation/organizations/organizations.module';
import { UsersModule } from './presentation/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    AuditLogModule,
    OrganizationsModule,
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
