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
import { Supplier } from '../../domain/suppliers/supplier.domain';
import { SuppliersService } from '../../domain/suppliers/suppliers.service';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { Roles } from '../common/auth/roles.decorator';
import { RolesGuard } from '../common/auth/roles.guard';
import { CreateSupplierDto, UpdateSupplierDto } from './suppliers.dto';

@Controller('suppliers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SuppliersController {
  constructor(private readonly service: SuppliersService) {}

  @Get()
  async list(@CurrentUser() ctx: AuthContext) {
    const items = await this.service.list(ctx.organizationId);
    return { items: items.map((s) => this.toPublic(s)) };
  }

  @Get(':id')
  async detail(@Param('id') id: string, @CurrentUser() ctx: AuthContext) {
    return this.toPublic(await this.service.requireById(id, ctx.organizationId));
  }

  @Post()
  @Roles(Role.OWNER, Role.ADMIN)
  async create(@Body() body: CreateSupplierDto, @CurrentUser() ctx: AuthContext) {
    return this.toPublic(await this.service.create(body, ctx));
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() body: UpdateSupplierDto,
    @CurrentUser() ctx: AuthContext,
  ) {
    return this.toPublic(await this.service.update(id, body, ctx));
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  @HttpCode(204)
  async delete(@Param('id') id: string, @CurrentUser() ctx: AuthContext): Promise<void> {
    await this.service.softDelete(id, ctx);
  }

  private toPublic(s: Supplier) {
    return {
      id: s.id,
      name: s.name,
      contactPerson: s.contactPerson,
      phone: s.phone,
      email: s.email,
      note: s.note,
    };
  }
}
