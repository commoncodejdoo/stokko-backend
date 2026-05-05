import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtTokenService } from '../../../domain/auth/jwt-token.service';

export interface AdminRequestContext {
  adminId: string;
}

/**
 * Guard for platform-admin routes. Verifies a `platform-admin` JWT —
 * completely separate from `JwtAuthGuard` (which handles tenant tokens).
 * Tenant tokens are rejected even if they pass signature verification.
 */
@Injectable()
export class PlatformAdminGuard implements CanActivate {
  constructor(private readonly jwt: JwtTokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<{
      headers: Record<string, string | undefined>;
      admin?: AdminRequestContext;
    }>();

    const authHeader = req.headers['authorization'];
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing admin token');
    }

    const token = authHeader.slice(7);
    const payload = await this.jwt.verifyAdminToken(token).catch(() => {
      throw new UnauthorizedException('Invalid or expired admin token');
    });

    req.admin = { adminId: payload.adminId };
    return true;
  }
}
