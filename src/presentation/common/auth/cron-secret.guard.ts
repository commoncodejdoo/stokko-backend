import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

/**
 * Cron-only guard for internal admin endpoints. Validates the
 * `X-Cron-Secret` header against `PREDICTIONS_CRON_SECRET` env var.
 *
 * Used by:
 *  - /predictions/internal/recompute-all
 *  - /narratives/internal/generate-digests
 *
 * No JWT involved — the GitHub Actions workflow has no user identity.
 * If the env var is unset, every request is rejected (fail-closed).
 */
@Injectable()
export class CronSecretGuard implements CanActivate {
  private readonly logger = new Logger(CronSecretGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const headerSecret = req.header('x-cron-secret');
    const envSecret = process.env.PREDICTIONS_CRON_SECRET;

    if (!envSecret) {
      this.logger.warn('PREDICTIONS_CRON_SECRET not set — cron endpoints disabled');
      throw new UnauthorizedException('Cron endpoint disabled');
    }
    if (!headerSecret || headerSecret !== envSecret) {
      throw new UnauthorizedException('Invalid cron secret');
    }
    return true;
  }
}
