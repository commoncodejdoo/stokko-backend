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
import { StockTransfer } from '../../domain/transfers/stock-transfer.domain';
import { TransfersService } from '../../domain/transfers/transfers.service';
import { Role } from '../../domain/common/role';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { Roles } from '../common/auth/roles.decorator';
import { RolesGuard } from '../common/auth/roles.guard';
import { CreateTransferDto, ListTransfersQueryDto } from './transfers.dto';

@Controller('stock/transfers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransfersController {
  constructor(private readonly service: TransfersService) {}

  @Get()
  async list(
    @Query() q: ListTransfersQueryDto,
    @CurrentUser() ctx: AuthContext,
  ) {
    const page = q.page ? Number(q.page) : 1;
    const pageSize = q.pageSize ? Number(q.pageSize) : 50;
    const { items, total } = await this.service.list({
      organizationId: ctx.organizationId,
      warehouseId: q.warehouseId,
      page,
      pageSize,
    });
    return {
      items: items.map((t) => this.toPublic(t)),
      pagination: { page, pageSize, total },
    };
  }

  @Get(':id')
  async detail(@Param('id') id: string, @CurrentUser() ctx: AuthContext) {
    const t = await this.service.findById(id, ctx.organizationId);
    return this.toPublic(t);
  }

  @Post()
  @Roles(Role.OWNER, Role.ADMIN)
  async create(
    @Body() body: CreateTransferDto,
    @CurrentUser() ctx: AuthContext,
  ) {
    const t = await this.service.create(body, ctx);
    return this.toPublic(t);
  }

  private toPublic(t: StockTransfer) {
    return {
      id: t.id,
      sourceWarehouseId: t.sourceWarehouseId,
      destinationWarehouseId: t.destinationWarehouseId,
      createdById: t.createdById,
      note: t.note,
      createdAt: t.createdAt.toISOString(),
      items: t.items.map((i) => ({
        id: i.id,
        articleId: i.articleId,
        quantity: i.quantity.toFixed(3),
      })),
    };
  }
}
