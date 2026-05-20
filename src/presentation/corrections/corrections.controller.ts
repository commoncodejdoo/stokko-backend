import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { AuthContext } from '../../domain/common/auth-context';
import { StockCorrection } from '../../domain/corrections/correction.domain';
import { CorrectionsService } from '../../domain/corrections/corrections.service';
import { Role } from '../../domain/common/role';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { Roles } from '../common/auth/roles.decorator';
import { RolesGuard } from '../common/auth/roles.guard';
import {
  CreateCorrectionDto,
  ListCorrectionsQueryDto,
} from './corrections.dto';

@Controller('stock/corrections')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CorrectionsController {
  constructor(private readonly service: CorrectionsService) {}

  @Get()
  async list(
    @Query() q: ListCorrectionsQueryDto,
    @CurrentUser() ctx: AuthContext,
  ) {
    const page = q.page ? Number(q.page) : 1;
    const pageSize = q.pageSize ? Number(q.pageSize) : 50;
    const { items, total } = await this.service.list({
      organizationId: ctx.organizationId,
      articleId: q.articleId,
      warehouseId: q.warehouseId,
      page,
      pageSize,
    });
    return {
      items: items.map((c) => this.toPublic(c)),
      pagination: { page, pageSize, total },
    };
  }

  @Get(':id')
  async detail(@Param('id') id: string, @CurrentUser() ctx: AuthContext) {
    const c = await this.service.findById(id, ctx.organizationId);
    return this.toPublic(c);
  }

  @Post()
  @Roles(Role.OWNER, Role.ADMIN)
  async create(
    @Body() body: CreateCorrectionDto,
    @CurrentUser() ctx: AuthContext,
  ) {
    const c = await this.service.create(body, ctx);
    return this.toPublic(c);
  }

  private toPublic(c: StockCorrection) {
    return {
      id: c.id,
      articleId: c.articleId,
      warehouseId: c.warehouseId,
      type: c.type,
      value: c.value.toFixed(3),
      reason: c.reason,
      note: c.note,
      createdById: c.createdById,
      createdAt: c.createdAt.toISOString(),
    };
  }
}
