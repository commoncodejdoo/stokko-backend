import { Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { NarrativesService } from '../../domain/narratives/narratives.service';
import { CronSecretGuard } from '../common/auth/cron-secret.guard';

@Controller('narratives/internal')
@UseGuards(CronSecretGuard)
export class NarrativesAdminController {
  constructor(private readonly service: NarrativesService) {}

  @Post('generate-digests')
  @HttpCode(200)
  async generateAll() {
    const result = await this.service.generateDailyDigestForAllOrgs();
    return result;
  }
}
