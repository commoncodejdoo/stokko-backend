import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import type { AuthContext } from '../../domain/common/auth-context';
import { Role } from '../../domain/common/role';
import {
  SalesReport,
  SalesReportService,
} from '../../domain/sales/sales-report.service';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { Roles } from '../common/auth/roles.decorator';
import { RolesGuard } from '../common/auth/roles.guard';
import { SalesReportQueryDto } from './sales-report.dto';

@Controller('sales')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.OWNER, Role.ADMIN)
export class SalesReportController {
  constructor(private readonly service: SalesReportService) {}

  @Get('report')
  async report(
    @Query() q: SalesReportQueryDto,
    @CurrentUser() ctx: AuthContext,
  ) {
    const offset = q.offset ? Number(q.offset) : 0;
    const report = await this.service.getReport(
      ctx.organizationId,
      q.period,
      offset,
    );
    return this.toPublic(report);
  }

  private toPublic(r: SalesReport) {
    return {
      period: {
        kind: r.period.kind,
        offset: r.period.offset,
        from: r.period.from.toISOString(),
        to: r.period.to.toISOString(),
        label: r.period.label,
      },
      totals: r.totals,
      byDate: r.byDate,
      byArticle: r.byArticle,
      shifts: r.shifts,
    };
  }
}
