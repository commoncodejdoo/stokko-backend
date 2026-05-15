import { Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { PredictionsService } from '../../domain/predictions/predictions.service';
import { CronSecretGuard } from '../common/auth/cron-secret.guard';

/**
 * Internal cron-only endpoints — guarded by X-Cron-Secret header, never JWT.
 * Invoked by GitHub Actions workflow (or manual curl with the secret).
 */
@Controller('predictions/internal')
@UseGuards(CronSecretGuard)
export class PredictionsAdminController {
  constructor(private readonly service: PredictionsService) {}

  @Post('recompute-all')
  @HttpCode(200)
  async recomputeAll() {
    const results = await this.service.recomputeAllOrgs();
    return {
      orgsProcessed: results.length,
      results: results.map((r) => ({
        ...r,
        computedAt: r.computedAt.toISOString(),
      })),
    };
  }
}
