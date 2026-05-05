import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminStatsService } from '../../domain/admin/admin-stats.service';
import { PlatformAdminGuard } from '../common/auth/platform-admin.guard';

@Controller('admin/stats')
@UseGuards(PlatformAdminGuard)
export class AdminStatsController {
  constructor(private readonly stats: AdminStatsService) {}

  @Get()
  async get() {
    return this.stats.getStats();
  }
}
