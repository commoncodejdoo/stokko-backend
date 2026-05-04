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
import { Procurement } from '../../domain/procurements/procurement.domain';
import { ProcurementsService } from '../../domain/procurements/procurements.service';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { CreateProcurementDto, ListProcurementsQueryDto } from './procurements.dto';

@Controller('procurements')
@UseGuards(JwtAuthGuard)
export class ProcurementsController {
  constructor(private readonly service: ProcurementsService) {}

  @Get()
  async list(@Query() q: ListProcurementsQueryDto, @CurrentUser() ctx: AuthContext) {
    const page = q.page ? Number(q.page) : 1;
    const pageSize = q.pageSize ? Number(q.pageSize) : 50;
    const createdSince = q.createdSince ? new Date(q.createdSince) : undefined;
    const { items, total } = await this.service.list({
      organizationId: ctx.organizationId,
      supplierId: q.supplierId,
      warehouseId: q.warehouseId,
      createdSince,
      page,
      pageSize,
    });
    return {
      items: items.map((p) => this.toPublic(p)),
      pagination: { page, pageSize, total },
    };
  }

  @Get(':id')
  async detail(@Param('id') id: string, @CurrentUser() ctx: AuthContext) {
    const p = await this.service.findById(id, ctx.organizationId);
    return this.toPublic(p);
  }

  @Post()
  async create(@Body() body: CreateProcurementDto, @CurrentUser() ctx: AuthContext) {
    const p = await this.service.create(body, ctx);
    return this.toPublic(p);
  }

  private toPublic(p: Procurement) {
    const total = p.totalValue();
    return {
      id: p.id,
      supplierId: p.supplierId,
      warehouseId: p.warehouseId,
      createdById: p.createdById,
      note: p.note,
      createdAt: p.createdAt.toISOString(),
      currency: p.currency,
      totalValue: total.toFixed(),
      items: p.items.map((i) => ({
        id: i.id,
        articleId: i.articleId,
        quantity: i.quantity.toFixed(3),
        purchasePrice: i.purchasePrice.toFixed(),
        lineTotal: i.lineTotal().toFixed(),
      })),
    };
  }
}
