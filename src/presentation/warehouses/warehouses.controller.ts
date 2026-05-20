import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { ArticlesService } from '../../domain/articles/articles.service';
import type { AuthContext } from '../../domain/common/auth-context';
import { Role } from '../../domain/common/role';
import { computeStockStatus } from '../../domain/common/stock-status';
import { OrganizationsService } from '../../domain/organizations/organizations.service';
import { StockService } from '../../domain/stock/stock.service';
import { UserWarehouseAccessService } from '../../domain/user-warehouse-access/user-warehouse-access.service';
import { Warehouse } from '../../domain/warehouses/warehouse.domain';
import { WarehousesService } from '../../domain/warehouses/warehouses.service';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { Roles } from '../common/auth/roles.decorator';
import { RolesGuard } from '../common/auth/roles.guard';
import {
  CreateWarehouseDto,
  ReplaceWarehouseUsersDto,
  UpdateWarehouseDto,
} from './warehouses.dto';

@Controller('warehouses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WarehousesController {
  constructor(
    private readonly service: WarehousesService,
    private readonly articles: ArticlesService,
    private readonly stock: StockService,
    private readonly orgs: OrganizationsService,
    private readonly access: UserWarehouseAccessService,
  ) {}

  @Get()
  async list(@CurrentUser() ctx: AuthContext) {
    const items = await this.service.list(ctx.organizationId);
    // EMPLOYEE only sees warehouses they have explicit access to. OWNER and
    // ADMIN see everything.
    if (ctx.role === Role.EMPLOYEE) {
      const allowed = new Set(await this.access.allowedWarehouseIdsForCtx(ctx));
      return { items: items.filter((w) => allowed.has(w.id)).map((w) => this.toPublic(w)) };
    }
    return { items: items.map((w) => this.toPublic(w)) };
  }

  @Get(':id')
  async detail(@Param('id') id: string, @CurrentUser() ctx: AuthContext) {
    const wh = await this.service.requireById(id, ctx.organizationId);
    await this.access.requireAccessForCtx(ctx, wh.id);
    return this.toPublic(wh);
  }

  @Post()
  @Roles(Role.OWNER, Role.ADMIN)
  async create(@Body() body: CreateWarehouseDto, @CurrentUser() ctx: AuthContext) {
    const wh = await this.service.create(body, ctx);
    return this.toPublic(wh);
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() body: UpdateWarehouseDto,
    @CurrentUser() ctx: AuthContext,
  ) {
    const wh = await this.service.update(id, body, ctx);
    return this.toPublic(wh);
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  @HttpCode(204)
  async delete(@Param('id') id: string, @CurrentUser() ctx: AuthContext): Promise<void> {
    await this.service.softDelete(id, ctx);
  }

  /**
   * Articles present in this warehouse with their per-warehouse quantities
   * + per-warehouse stock status. Powers the mobile WarehouseDetail screen
   * (Phase 7b). Cross-org guard runs before any data is exposed.
   */
  @Get(':id/articles')
  async listArticles(@Param('id') id: string, @CurrentUser() ctx: AuthContext) {
    await this.service.requireById(id, ctx.organizationId);
    await this.access.requireAccessForCtx(ctx, id);

    const [stockEntries, allArticles] = await Promise.all([
      this.stock.getByWarehouse(id),
      this.articles.list({ organizationId: ctx.organizationId }),
    ]);

    const articleById = new Map(allArticles.map((a) => [a.id, a]));
    const items: Array<{
      articleId: string;
      sku: string;
      name: string;
      unit: string;
      categoryId: string;
      supplierId: string | null;
      quantity: string;
      status: string;
      purchasePrice: string;
      currency: string;
    }> = [];

    let totalQuantity = new Decimal(0);
    let totalValue = new Decimal(0);
    let articleCount = 0;

    for (const entry of stockEntries) {
      const a = articleById.get(entry.articleId);
      if (!a) continue; // soft-deleted articles are skipped from the list
      const status = computeStockStatus(
        entry.quantity,
        a.thresholdWarning,
        a.thresholdCritical,
      );
      items.push({
        articleId: a.id,
        sku: a.sku,
        name: a.name,
        unit: a.unit,
        categoryId: a.categoryId,
        supplierId: a.supplierId,
        quantity: entry.quantity.toFixed(3),
        status,
        purchasePrice: a.purchasePrice.toFixed(),
        currency: a.purchasePrice.currency,
      });
      if (!entry.quantity.isZero()) {
        articleCount += 1;
        totalQuantity = totalQuantity.plus(entry.quantity);
        totalValue = totalValue.plus(entry.quantity.times(a.purchasePrice.amount));
      }
    }

    // Stable order: name asc.
    items.sort((x, y) => x.name.localeCompare(y.name, 'hr'));

    const org = await this.orgs.requireById(ctx.organizationId);
    return {
      items,
      summary: {
        articleCount,
        totalQuantity: totalQuantity.toFixed(3),
        totalValue: totalValue.toFixed(2),
        currency: org.currency,
      },
    };
  }

  @Get(':id/users')
  @Roles(Role.OWNER, Role.ADMIN)
  async listUsers(@Param('id') id: string, @CurrentUser() ctx: AuthContext) {
    const rows = await this.access.listForWarehouse(id, ctx.organizationId);
    return { userIds: rows.map((r) => r.userId) };
  }

  @Put(':id/users')
  @Roles(Role.OWNER, Role.ADMIN)
  async replaceUsers(
    @Param('id') id: string,
    @Body() body: ReplaceWarehouseUsersDto,
    @CurrentUser() ctx: AuthContext,
  ) {
    const rows = await this.access.replaceForWarehouse(id, body.userIds, ctx);
    return { userIds: rows.map((r) => r.userId) };
  }

  private toPublic(wh: Warehouse) {
    return {
      id: wh.id,
      name: wh.name,
      color: wh.color,
      kind: wh.kind,
      initials: wh.initials(),
    };
  }
}
