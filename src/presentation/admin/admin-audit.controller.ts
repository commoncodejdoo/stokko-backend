import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditLogService } from '../../domain/audit-log/audit-log.service';
import { PlatformAdminGuard } from '../common/auth/platform-admin.guard';
import { PaginationDto } from './admin.dto';
import { IsOptional, IsString } from 'class-validator';

class AuditLogQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  orgId?: string;
}

@Controller('admin/audit-logs')
@UseGuards(PlatformAdminGuard)
export class AdminAuditController {
  constructor(private readonly auditLog: AuditLogService) {}

  @Get()
  async list(@Query() query: AuditLogQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const { items, total } = await this.auditLog.listPaginated({
      organizationId: query.orgId,
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
