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
import { CategoriesService } from '../../domain/categories/categories.service';
import type { AuthContext } from '../../domain/common/auth-context';
import { Role } from '../../domain/common/role';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { Roles } from '../common/auth/roles.decorator';
import { RolesGuard } from '../common/auth/roles.guard';
import { CreateCategoryDto, UpdateCategoryDto } from './categories.dto';

@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  @Get()
  async list(@CurrentUser() ctx: AuthContext) {
    const cats = await this.service.list(ctx.organizationId);
    return { items: cats.map((c) => this.toPublic(c)) };
  }

  @Post()
  @Roles(Role.OWNER, Role.ADMIN)
  async create(@Body() body: CreateCategoryDto, @CurrentUser() ctx: AuthContext) {
    const cat = await this.service.create(body.name, ctx);
    return this.toPublic(cat);
  }

  @Patch(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() body: UpdateCategoryDto,
    @CurrentUser() ctx: AuthContext,
  ) {
    const cat = await this.service.update(id, body, ctx);
    return this.toPublic(cat);
  }

  @Delete(':id')
  @Roles(Role.OWNER, Role.ADMIN)
  @HttpCode(204)
  async delete(@Param('id') id: string, @CurrentUser() ctx: AuthContext): Promise<void> {
    await this.service.softDelete(id, ctx);
  }

  private toPublic(cat: { id: string; name: string; isPredefined: boolean }) {
    return { id: cat.id, name: cat.name, isPredefined: cat.isPredefined };
  }
}
