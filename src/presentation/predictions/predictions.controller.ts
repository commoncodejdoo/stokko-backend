import {
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { AuthContext } from '../../domain/common/auth-context';
import { Role } from '../../domain/common/role';
import { PredictionSnapshot } from '../../domain/predictions/prediction-snapshot.domain';
import { PredictionsService } from '../../domain/predictions/predictions.service';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { Roles } from '../common/auth/roles.decorator';
import { RolesGuard } from '../common/auth/roles.guard';
import { ListPredictionsQueryDto } from './predictions.dto';

@Controller('predictions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PredictionsController {
  constructor(private readonly service: PredictionsService) {}

  @Get('current')
  async list(
    @Query() q: ListPredictionsQueryDto,
    @CurrentUser() ctx: AuthContext,
  ) {
    const snapshots = await this.service.listLatest({
      organizationId: ctx.organizationId,
      warehouseId: q.warehouseId,
      urgency: q.urgency,
      shouldReorderOnly: q.shouldReorderOnly === 'true',
    });
    return {
      items: snapshots.map((s) => this.toPublic(s)),
      summary: this.summarise(snapshots),
    };
  }

  @Post('recompute')
  @Roles(Role.OWNER, Role.ADMIN)
  @HttpCode(200)
  async recompute(@CurrentUser() ctx: AuthContext) {
    const summary = await this.service.recomputeOrg(
      ctx.organizationId,
      ctx.userId,
    );
    return {
      ...summary,
      computedAt: summary.computedAt.toISOString(),
    };
  }

  private toPublic(s: PredictionSnapshot) {
    return {
      id: s.id,
      warehouseId: s.warehouseId,
      articleId: s.articleId,
      currentStock: s.currentStock.toFixed(3),
      avgDailyConsumption: s.avgDailyConsumption?.toFixed(3) ?? null,
      daysOfSupply: s.daysOfSupply?.toFixed(2) ?? null,
      shouldReorder: s.shouldReorder,
      suggestedQty: s.suggestedQty.toFixed(3),
      urgency: s.urgency,
      leadTimeDaysUsed: s.leadTimeDaysUsed,
      safetyDaysUsed: s.safetyDaysUsed,
      coverageDaysUsed: s.coverageDaysUsed,
      signalWindowDays: s.signalWindowDays,
      computedAt: s.computedAt.toISOString(),
      validUntil: s.validUntil.toISOString(),
    };
  }

  private summarise(snapshots: PredictionSnapshot[]) {
    let criticalCount = 0;
    let warningCount = 0;
    let okCount = 0;
    let shouldReorderCount = 0;
    for (const s of snapshots) {
      if (s.urgency === 'CRITICAL') criticalCount += 1;
      else if (s.urgency === 'WARNING') warningCount += 1;
      else okCount += 1;
      if (s.shouldReorder) shouldReorderCount += 1;
    }
    return { criticalCount, warningCount, okCount, shouldReorderCount };
  }
}
