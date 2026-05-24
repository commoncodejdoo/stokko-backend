import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthContext } from '../../../domain/common/auth-context';
import { OrganizationsService } from '../../../domain/organizations/organizations.service';
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
 * Loads the org's `priceTrackingEnabled` flag on every request so
 * downstream interceptors can decide whether to strip cost/revenue
 * fields from responses. The lookup is by primary key (sub-ms on Neon).
 *
 * Used by `JwtAuthGuard` (default `'jwt'` strategy name).
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly orgs: OrganizationsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: RawJwtPayload): Promise<AuthContext> {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Wrong token type');
    }
    const org = await this.orgs.findById(payload.organizationId);
    return {
      userId: payload.userId,
      organizationId: payload.organizationId,
      role: payload.role,
      impersonatedBy: payload.impersonatedBy,
      // Default to true if the org somehow disappeared between issuing the
      // token and this request — fail-safe to current behavior.
      priceTrackingEnabled: org?.priceTrackingEnabled ?? true,
    };
  }
}
