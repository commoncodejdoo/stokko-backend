import { Controller, Get, UseGuards } from '@nestjs/common';
import type { AuthContext } from '../../domain/common/auth-context';
import {
  DashboardActivityEntry,
  DashboardOverview,
  DashboardService,
  DashboardWarehouseStat,
} from '../../domain/dashboard/dashboard.service';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get()
  async overview(@CurrentUser() ctx: AuthContext) {
    const data = await this.service.getOverview(ctx.organizationId);
    return this.toPublic(data);
  }

  private toPublic(d: DashboardOverview) {
    return {
      counts: d.counts,
      perWarehouse: d.perWarehouse.map((w) => this.warehouseToPublic(w)),
      recentActivity: d.recentActivity.map((a) => this.activityToPublic(a)),
    };
  }

  private warehouseToPublic(w: DashboardWarehouseStat) {
    return {
      warehouseId: w.warehouseId,
      name: w.name,
      color: w.color,
      initials: w.initials,
      articleCount: w.articleCount,
      totalQuantity: w.totalQuantity.toFixed(3),
      totalValue: w.totalValue.toFixed(2),
      currency: w.currency,
    };
  }

  private activityToPublic(a: DashboardActivityEntry) {
    return {
      id: a.id,
      action: a.action,
      entityType: a.entityType,
      entityId: a.entityId,
      user: a.user,
      before: a.before,
      after: a.after,
      createdAt: a.createdAt.toISOString(),
    };
  }
}
