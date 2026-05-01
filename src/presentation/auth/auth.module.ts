import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { NestJwtTokenService } from '../../data/auth/jwt-token.service';
import { Sha256RefreshTokenCodec } from '../../data/auth/refresh-token-codec';
import { PrismaRefreshTokensRepository } from '../../data/auth/refresh-tokens.repository';
import { AuthService } from '../../domain/auth/auth.service';
import { JwtTokenService } from '../../domain/auth/jwt-token.service';
import { RefreshTokenCodec } from '../../domain/auth/refresh-token-codec';
import { RefreshTokensRepository } from '../../domain/auth/refresh-tokens.repository';
import { AuditLogModule } from '../audit-log/audit-log.module';
import { JwtStrategy } from '../common/auth/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: (config.get<string>('JWT_ACCESS_TTL') ?? '15m') as `${number}${'s' | 'm' | 'h' | 'd'}`,
        },
      }),
    }),
    UsersModule,
    AuditLogModule,
  ],
  controllers: [AuthController],
  providers: [
    JwtStrategy,
    { provide: RefreshTokensRepository, useClass: PrismaRefreshTokensRepository },
    { provide: RefreshTokenCodec, useClass: Sha256RefreshTokenCodec },
    { provide: JwtTokenService, useClass: NestJwtTokenService },
    AuthService,
  ],
  exports: [AuthService, JwtTokenService],
})
export class AuthModule {}
