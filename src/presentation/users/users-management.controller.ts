import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import type { AuthContext } from '../../domain/common/auth-context';
import { DomainValidationError } from '../../domain/common/errors';
import { Role } from '../../domain/common/role';
import { UserWarehouseAccessService } from '../../domain/user-warehouse-access/user-warehouse-access.service';
import { UsersService } from '../../domain/users/users.service';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { Roles } from '../common/auth/roles.decorator';
import { RolesGuard } from '../common/auth/roles.guard';
import {
  InviteUserDto,
  ReplaceUserWarehousesDto,
  UpdateUserDto,
} from './users.dto';

/**
 * Owner-facing user management. The `/me` endpoint lives in
 * `UsersController` because it has different auth + path semantics.
 *
 * Every mutation is Owner-only; `GET /users` is open to any authenticated
 * member of the org so menu screens can show team rosters if needed.
 */
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersManagementController {
  constructor(
    private readonly users: UsersService,
    private readonly warehouseAccess: UserWarehouseAccessService,
  ) {}

  @Get()
  async list(@CurrentUser() ctx: AuthContext) {
    const users = await this.users.listByOrg(ctx.organizationId);
    return { items: users.map((u) => u.toPublic()) };
  }

  @Post()
  @Roles(Role.OWNER)
  async invite(@Body() body: InviteUserDto, @CurrentUser() ctx: AuthContext) {
    // Soft pre-check — prevent the duplicate email collision before hitting
    // the unique constraint, so the response carries a friendly error code.
    const existing = await this.users.findByEmailInOrg(body.email, ctx.organizationId);
    if (existing) {
      throw new DomainValidationError(
        `User with email "${body.email}" already exists in this organization`,
        { email: body.email },
      );
    }

    const { user, temporaryPassword } = await this.users.invite(
      {
        organizationId: ctx.organizationId,
        email: body.email,
        firstName: body.firstName.trim(),
        lastName: body.lastName.trim(),
        role: body.role,
      },
      ctx.userId,
    );
    return {
      user: user.toPublic(),
      temporaryPassword,
    };
  }

  @Patch(':id')
  @Roles(Role.OWNER)
  async update(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
    @CurrentUser() ctx: AuthContext,
  ) {
    if (
      body.firstName === undefined &&
      body.lastName === undefined &&
      body.role === undefined
    ) {
      throw new BadRequestException('No fields to update');
    }
    await this.users.requireInOrg(id, ctx.organizationId);
    const updated = await this.users.updateProfile(
      id,
      {
        firstName: body.firstName?.trim(),
        lastName: body.lastName?.trim(),
        role: body.role,
      },
      ctx.userId,
    );
    return updated.toPublic();
  }

  @Post(':id/deactivate')
  @Roles(Role.OWNER)
  @HttpCode(200)
  async deactivate(@Param('id') id: string, @CurrentUser() ctx: AuthContext) {
    await this.users.requireInOrg(id, ctx.organizationId);
    const u = await this.users.deactivate(id, ctx.userId);
    return u.toPublic();
  }

  @Post(':id/reactivate')
  @Roles(Role.OWNER)
  @HttpCode(200)
  async reactivate(@Param('id') id: string, @CurrentUser() ctx: AuthContext) {
    await this.users.requireInOrg(id, ctx.organizationId);
    const u = await this.users.reactivate(id, ctx.userId);
    return u.toPublic();
  }

  @Post(':id/reset-password')
  @Roles(Role.OWNER)
  @HttpCode(200)
  async resetPassword(@Param('id') id: string, @CurrentUser() ctx: AuthContext) {
    await this.users.requireInOrg(id, ctx.organizationId);
    const { user, temporaryPassword } = await this.users.resetPassword(id, ctx.userId);
    return {
      user: user.toPublic(),
      temporaryPassword,
    };
  }

  @Get(':id/warehouses')
  @Roles(Role.OWNER, Role.ADMIN)
  async listWarehouses(@Param('id') id: string, @CurrentUser() ctx: AuthContext) {
    const rows = await this.warehouseAccess.listForUser(id, ctx.organizationId);
    return { warehouseIds: rows.map((r) => r.warehouseId) };
  }

  @Put(':id/warehouses')
  @Roles(Role.OWNER, Role.ADMIN)
  async replaceWarehouses(
    @Param('id') id: string,
    @Body() body: ReplaceUserWarehousesDto,
    @CurrentUser() ctx: AuthContext,
  ) {
    const rows = await this.warehouseAccess.replaceForUser(id, body.warehouseIds, ctx);
    return { warehouseIds: rows.map((r) => r.warehouseId) };
  }
}
