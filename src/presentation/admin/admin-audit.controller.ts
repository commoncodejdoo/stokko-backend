import { BadRequestException, Controller, Get, Query, UseGuards } from '@nestjs/common';
import { IsISO8601, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { AuditLogService } from '../../domain/audit-log/audit-log.service';
import { PlatformAdminGuard } from '../common/auth/platform-admin.guard';
import { PaginationDto } from './admin.dto';

class AuditLogQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  orgId?: string;

  /**
   * Accepts a single action or comma-separated list:
   *   ?action=ARTICLE_UPDATED
   *   ?action=ARTICLE_UPDATED,PROCUREMENT_CREATED
   * Repeated `?action=X&action=Y` query also works (Express parses as array).
   */
  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return value.split(',').filter((s) => s.length > 0);
    return undefined;
  })
  action?: string[];

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsISO8601()
  dateFrom?: string;

  @IsOptional()
  @IsISO8601()
  dateTo?: string;
}

@Controller('admin/audit-logs')
@UseGuards(PlatformAdminGuard)
export class AdminAuditController {
  constructor(private readonly auditLog: AuditLogService) {}

  @Get()
  async list(@Query() query: AuditLogQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const dateFrom = query.dateFrom ? new Date(query.dateFrom) : undefined;
    const dateTo = query.dateTo ? new Date(query.dateTo) : undefined;
    if (dateFrom && Number.isNaN(dateFrom.getTime())) {
      throw new BadRequestException('Invalid dateFrom');
    }
    if (dateTo && Number.isNaN(dateTo.getTime())) {
      throw new BadRequestException('Invalid dateTo');
    }

    const { items, total } = await this.auditLog.listPaginated({
      organizationId: query.orgId,
      actions: query.action,
      entityType: query.entityType,
      userId: query.userId,
      dateFrom,
      dateTo,
      page,
      pageSize: limit,
    });
    return {
      items: items.map((e) => ({
        id: e.id,
        organizationId: e.organizationId,
        userId: e.userId,
        action: e.action,
        entityType: e.entityType,
        entityId: e.entityId,
        before: e.before,
        after: e.after,
        createdAt: e.createdAt.toISOString(),
      })),
      total,
      page,
      limit,
    };
  }
}
