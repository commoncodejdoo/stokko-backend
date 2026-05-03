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
import { Warehouse } from '../../domain/warehouses/warehouse.domain';
import { WarehousesService } from '../../domain/warehouses/warehouses.service';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { Roles } from '../common/auth/roles.decorator';
import { RolesGuard } from '../common/auth/roles.guard';
import { CreateWarehouseDto, UpdateWarehouseDto } from './warehouses.dto';

@Controller('warehouses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WarehousesController {
  constructor(private readonly service: WarehousesService) {}

  @Get()
  async list(@CurrentUser() ctx: AuthContext) {
    const items = await this.service.list(ctx.organizationId);
    return { items: items.map((w) => this.toPublic(w)) };
  }

  @Get(':id')
  async detail(@Param('id') id: string, @CurrentUser() ctx: AuthContext) {
    const wh = await this.service.requireById(id, ctx.organizationId);
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

  private toPublic(wh: Warehouse) {
    return {
      id: wh.id,
      name: wh.name,
      color: wh.color,
      initials: wh.initials(),
    };
  }
}
