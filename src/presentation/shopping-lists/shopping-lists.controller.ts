import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { AuthContext } from '../../domain/common/auth-context';
import { Role } from '../../domain/common/role';
import { ShoppingListItem } from '../../domain/shopping-lists/shopping-list-item.domain';
import { ShoppingList } from '../../domain/shopping-lists/shopping-list.domain';
import { ShoppingListsService } from '../../domain/shopping-lists/shopping-lists.service';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { Roles } from '../common/auth/roles.decorator';
import { RolesGuard } from '../common/auth/roles.guard';
import {
  AddShoppingListItemDto,
  UpdateShoppingListItemDto,
} from './shopping-lists.dto';

@Controller('shopping-lists')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ShoppingListsController {
  constructor(private readonly service: ShoppingListsService) {}

  @Get('active')
  async active(@CurrentUser() ctx: AuthContext) {
    const list = await this.service.getActive(ctx.organizationId);
    return list ? this.toPublic(list) : null;
  }

  @Get(':id')
  async detail(@Param('id') id: string, @CurrentUser() ctx: AuthContext) {
    const list = await this.service.findById(id, ctx.organizationId);
    return this.toPublic(list);
  }

  @Post()
  @Roles(Role.OWNER, Role.ADMIN)
  async create(@CurrentUser() ctx: AuthContext) {
    const list = await this.service.createFromCurrentSnapshot(ctx);
    return this.toPublic(list);
  }

  @Post(':id/items')
  @Roles(Role.OWNER, Role.ADMIN)
  async addItem(
    @Param('id') id: string,
    @Body() body: AddShoppingListItemDto,
    @CurrentUser() ctx: AuthContext,
  ) {
    const item = await this.service.addItem(
      id,
      {
        articleId: body.articleId,
        warehouseId: body.warehouseId,
        customQty: body.customQty,
        supplierId: body.supplierId,
      },
      ctx,
    );
    return this.toItemPublic(item);
  }

  @Patch(':id/items/:itemId')
  @Roles(Role.OWNER, Role.ADMIN)
  async updateItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() body: UpdateShoppingListItemDto,
    @CurrentUser() ctx: AuthContext,
  ) {
    const item = await this.service.updateItem(
      id,
      itemId,
      {
        customQty: body.customQty,
        supplierId: body.supplierId,
        isChecked: body.isChecked,
      },
      ctx,
    );
    return this.toItemPublic(item);
  }

  @Delete(':id/items/:itemId')
  @Roles(Role.OWNER, Role.ADMIN)
  @HttpCode(204)
  async removeItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @CurrentUser() ctx: AuthContext,
  ): Promise<void> {
    await this.service.removeItem(id, itemId, ctx);
  }

  @Post(':id/complete')
  @Roles(Role.OWNER, Role.ADMIN)
  async complete(@Param('id') id: string, @CurrentUser() ctx: AuthContext) {
    const { list, procurementIds } = await this.service.complete(id, ctx);
    return { ...this.toPublic(list), procurementIds };
  }

  @Post(':id/cancel')
  @Roles(Role.OWNER, Role.ADMIN)
  async cancel(@Param('id') id: string, @CurrentUser() ctx: AuthContext) {
    const list = await this.service.cancel(id, ctx);
    return this.toPublic(list);
  }

  private toPublic(l: ShoppingList) {
    return {
      id: l.id,
      organizationId: l.organizationId,
      status: l.status,
      createdById: l.createdById,
      completedById: l.completedById,
      completedAt: l.completedAt?.toISOString() ?? null,
      totalEstimateCents: l.totalEstimateCents,
      currency: l.currency,
      generatedFromSnapshotAt: l.generatedFromSnapshotAt?.toISOString() ?? null,
      note: l.note,
      createdAt: l.createdAt.toISOString(),
      updatedAt: l.updatedAt.toISOString(),
      items: l.items.map((i) => this.toItemPublic(i)),
    };
  }

  private toItemPublic(i: ShoppingListItem) {
    return {
      id: i.id,
      shoppingListId: i.shoppingListId,
      articleId: i.articleId,
      warehouseId: i.warehouseId,
      suggestedQty: i.suggestedQty.toFixed(3),
      customQty: i.customQty?.toFixed(3) ?? null,
      supplierId: i.supplierId,
      isChecked: i.isChecked,
      addedManually: i.addedManually,
      sortOrder: i.sortOrder,
      estimatedPriceCents: i.estimatedPriceCents,
    };
  }
}
