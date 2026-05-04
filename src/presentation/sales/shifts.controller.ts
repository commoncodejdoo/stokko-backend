import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { AuthContext } from '../../domain/common/auth-context';
import { Role } from '../../domain/common/role';
import { Sale } from '../../domain/sales/sale.domain';
import { SalesService } from '../../domain/sales/sales.service';
import { Shift } from '../../domain/sales/shift.domain';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { Roles } from '../common/auth/roles.decorator';
import { RolesGuard } from '../common/auth/roles.guard';
import { CloseShiftDto, ListShiftsQueryDto } from './sales.dto';

@Controller('shifts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ShiftsController {
  constructor(private readonly service: SalesService) {}

  @Get()
  async list(@Query() q: ListShiftsQueryDto, @CurrentUser() ctx: AuthContext) {
    const page = q.page ? Number(q.page) : 1;
    const pageSize = q.pageSize ? Number(q.pageSize) : 50;
    const { items, total } = await this.service.listShifts({
      organizationId: ctx.organizationId,
      page,
      pageSize,
    });
    return {
      items: items.map((s) => this.toShiftPublic(s)),
      pagination: { page, pageSize, total },
    };
  }

  @Get(':id')
  async detail(@Param('id') id: string, @CurrentUser() ctx: AuthContext) {
    const { shift, sales } = await this.service.findShiftById(id, ctx.organizationId);
    return {
      ...this.toShiftPublic(shift),
      sales: sales.map((s) => this.toSalePublic(s)),
    };
  }

  @Post('close')
  async close(@Body() body: CloseShiftDto, @CurrentUser() ctx: AuthContext) {
    const { shift, sales } = await this.service.closeShift(body, ctx);
    return {
      ...this.toShiftPublic(shift),
      sales: sales.map((s) => this.toSalePublic(s)),
    };
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  @HttpCode(204)
  async remove(@Param('id') id: string, @CurrentUser() ctx: AuthContext): Promise<void> {
    await this.service.deleteShift(id, ctx.organizationId, ctx);
  }

  private toShiftPublic(s: Shift) {
    return {
      id: s.id,
      date: s.date.toISOString(),
      openedAt: s.openedAt.toISOString(),
      closedAt: s.closedAt?.toISOString() ?? null,
      closedById: s.closedById,
      status: s.status,
      totalQuantity: s.totalQuantity.toFixed(3),
      totalRevenue: s.totalRevenue.toFixed(),
      currency: s.totalRevenue.currency,
    };
  }

  private toSalePublic(s: Sale) {
    return {
      id: s.id,
      shiftId: s.shiftId,
      warehouseId: s.warehouseId,
      createdById: s.createdById,
      createdAt: s.createdAt.toISOString(),
      currency: s.currency,
      totalQuantity: s.totalQuantity().toFixed(3),
      totalRevenue: s.totalRevenue().toFixed(),
      items: s.items.map((i) => ({
        id: i.id,
        articleId: i.articleId,
        quantity: i.quantity.toFixed(3),
        unitPrice: i.unitPrice.toFixed(),
        lineTotal: i.lineTotal().toFixed(),
      })),
    };
  }
}
