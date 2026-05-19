import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthContext } from '../../../domain/common/auth-context';
import { Role } from '../../../domain/common/role';

interface RawJwtPayload {
  sub: string;
  userId: string;
  organizationId: string;
  role: Role;
  type?: string;
  impersonatedBy?: string;
  iat: number;
  exp: number;
}

/**
 * Passport JWT strategy — extracts the bearer token, verifies the
 * signature + expiry, and writes an `AuthContext` onto `req.user`.
 *
 * Used by `JwtAuthGuard` (default `'jwt'` strategy name).
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: RawJwtPayload): AuthContext {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Wrong token type');
    }
    return {
      userId: payload.userId,
      organizationId: payload.organizationId,
      role: payload.role,
      impersonatedBy: payload.impersonatedBy,
    };
  }
}
