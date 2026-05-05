import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  AccessTokenClaims,
  AccessTokenPayload,
  AdminTokenClaims,
  AdminTokenPayload,
  JwtTokenService,
  PasswordChangeTokenClaims,
  PasswordChangeTokenPayload,
} from '../../domain/auth/jwt-token.service';
import { PasswordChangeTokenInvalidError } from '../../domain/auth/auth.errors';

type DurationString = `${number}${'s' | 'm' | 'h' | 'd'}`;

@Injectable()
export class NestJwtTokenService extends JwtTokenService {
  private readonly secret: string;
  private readonly accessTtl: DurationString;
  private readonly passwordChangeTtl: DurationString = '1h';

  constructor(
    private readonly jwt: JwtService,
    config: ConfigService,
  ) {
    super();
    this.secret = config.getOrThrow<string>('JWT_SECRET');
    this.accessTtl = (config.get<string>('JWT_ACCESS_TTL') ?? '15m') as DurationString;
  }

  async issueAccessToken(claims: AccessTokenClaims): Promise<string> {
    return this.jwt.signAsync(
      {
        sub: claims.userId,
        userId: claims.userId,
        organizationId: claims.organizationId,
        role: claims.role,
        type: 'access',
      },
      { secret: this.secret, expiresIn: this.accessTtl },
    );
  }

  async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    const payload = await this.jwt.verifyAsync<AccessTokenPayload>(token, {
      secret: this.secret,
    });
    if (payload.type !== 'access') {
      throw new Error('Wrong token type');
    }
    return payload;
  }

  async issuePasswordChangeToken(claims: PasswordChangeTokenClaims): Promise<string> {
    return this.jwt.signAsync(
      {
        sub: claims.userId,
        userId: claims.userId,
        organizationId: claims.organizationId,
        type: 'pwd-change',
      },
      { secret: this.secret, expiresIn: this.passwordChangeTtl },
    );
  }

  async verifyPasswordChangeToken(token: string): Promise<PasswordChangeTokenPayload> {
    try {
      const payload = await this.jwt.verifyAsync<PasswordChangeTokenPayload>(token, {
        secret: this.secret,
      });
      if (payload.type !== 'pwd-change') {
        throw new PasswordChangeTokenInvalidError();
      }
      return payload;
    } catch (err) {
      if (err instanceof PasswordChangeTokenInvalidError) throw err;
      throw new PasswordChangeTokenInvalidError();
    }
  }

  async issueAdminToken(claims: AdminTokenClaims): Promise<string> {
    return this.jwt.signAsync(
      { sub: claims.adminId, adminId: claims.adminId, type: 'platform-admin' },
      { secret: this.secret, expiresIn: '7d' },
    );
  }

  async verifyAdminToken(token: string): Promise<AdminTokenPayload> {
    const payload = await this.jwt.verifyAsync<AdminTokenPayload>(token, {
      secret: this.secret,
    });
    if (payload.type !== 'platform-admin') {
      throw new Error('Wrong token type');
    }
    return payload;
  }
}
