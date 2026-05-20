import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import type { AuthContext } from '../../domain/common/auth-context';
import { Role } from '../../domain/common/role';
import { WarehouseStockTargetsService } from '../../domain/warehouse-stock-targets/warehouse-stock-targets.service';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { Roles } from '../common/auth/roles.decorator';
import { RolesGuard } from '../common/auth/roles.guard';
import { ReplaceStockTargetsDto } from './warehouse-stock-targets.dto';

/**
 * Per-warehouse "optimalno stanje" (target quantity) management. Used by
 * the shift-close auto-replenish flow to compute deltas and propose
 * transfers from a BOH source.
 */
@Controller('warehouses/:warehouseId/stock-targets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WarehouseStockTargetsController {
  constructor(private readonly service: WarehouseStockTargetsService) {}

  @Get()
  async list(
    @Param('warehouseId') warehouseId: string,
    @CurrentUser() ctx: AuthContext,
  ) {
    const items = await this.service.list(warehouseId, ctx.organizationId);
    return {
      items: items.map((t) => ({
        warehouseId: t.warehouseId,
        articleId: t.articleId,
        targetQty: t.targetQty.toFixed(3),
        updatedAt: t.updatedAt.toISOString(),
      })),
    };
  }

  @Put()
  @Roles(Role.OWNER, Role.ADMIN)
  async replace(
    @Param('warehouseId') warehouseId: string,
    @Body() body: ReplaceStockTargetsDto,
    @CurrentUser() ctx: AuthContext,
  ) {
    const items = await this.service.replaceForWarehouse(warehouseId, body.items, ctx);
    return {
      items: items.map((t) => ({
        warehouseId: t.warehouseId,
        articleId: t.articleId,
        targetQty: t.targetQty.toFixed(3),
        updatedAt: t.updatedAt.toISOString(),
      })),
    };
  }
}
