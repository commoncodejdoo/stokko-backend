import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { AdminOrgService } from '../../domain/admin/admin-org.service';
import { Role } from '../../domain/common/role';
import { CurrentAdmin } from '../common/auth/current-admin.decorator';
import { PlatformAdminGuard } from '../common/auth/platform-admin.guard';
import type { AdminRequestContext } from '../common/auth/platform-admin.guard';
import { CreateOrgDto, PaginationDto, UpdateOrgDto } from './admin.dto';

class AdminUpdateUserDto {
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@Controller('admin/organizations')
@UseGuards(PlatformAdminGuard)
export class AdminOrgsController {
  constructor(private readonly adminOrg: AdminOrgService) {}

  @Get()
  async list(@Query() query: PaginationDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const { items, total } = await this.adminOrg.listOrgs({
      search: query.search,
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      items: items.map(({ org, userCount, lastActivityAt, riskLevel }) => ({
        ...org.toSnapshot(),
        userCount,
        lastActivityAt: lastActivityAt?.toISOString() ?? null,
        riskLevel,
      })),
      total,
      page,
      limit,
    };
  }

  @Post()
  async create(@Body() body: CreateOrgDto) {
    const { org, temporaryPassword } = await this.adminOrg.createOrgWithOwner({
      name: body.name.trim(),
      currency: body.currency,
      ownerEmail: body.ownerEmail,
      ownerFirstName: body.ownerFirstName.trim(),
      ownerLastName: body.ownerLastName.trim(),
    });
    return { org: org.toSnapshot(), temporaryPassword };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const { org, userCount, lastActivityAt, riskLevel } = await this.adminOrg.getOrg(id);
    return {
      ...org.toSnapshot(),
      userCount,
      lastActivityAt: lastActivityAt?.toISOString() ?? null,
      riskLevel,
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateOrgDto) {
    const org = await this.adminOrg.updateOrg(id, {
      name: body.name?.trim(),
      currency: body.currency,
      isActive: body.isActive,
    });
    return org.toSnapshot();
  }

  @Get(':id/users')
  async listUsers(@Param('id') id: string) {
    const { org, users } = await this.adminOrg.getOrgUsers(id);
    return {
      org: org.toSnapshot(),
      users: users.map((u) => u.toPublic()),
    };
  }

  @Get(':id/activity')
  async activity(@Param('id') id: string, @Query('days') daysRaw?: string) {
    const days = daysRaw ? Number.parseInt(daysRaw, 10) : 30;
    if (!Number.isFinite(days) || days < 1 || days > 90) {
      throw new BadRequestException('days must be between 1 and 90');
    }
    const a = await this.adminOrg.getOrgActivity(id, days);
    return {
      ...a,
      lastLoginAt: a.lastLoginAt?.toISOString() ?? null,
      lastActivityAt: a.lastActivityAt?.toISOString() ?? null,
    };
  }

  @Post(':id/impersonate')
  @HttpCode(200)
  async impersonate(
    @Param('id') id: string,
    @CurrentAdmin() admin: AdminRequestContext,
  ) {
    const session = await this.adminOrg.createImpersonationSession(id, admin.adminId);
    return {
      accessToken: session.accessToken,
      expiresAt: session.expiresAt.toISOString(),
      readOnly: true,
      user: session.user.toPublic(),
      organization: session.organization.toSnapshot(),
    };
  }

  @Post(':id/users/:userId/reset-password')
  @HttpCode(200)
  async resetUserPassword(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    const { user, temporaryPassword } = await this.adminOrg.adminResetUserPassword(
      id,
      userId,
    );
    return { user: user.toPublic(), temporaryPassword };
  }

  @Post(':id/users/:userId/resend-invite')
  @HttpCode(200)
  async resendInvite(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    // Resend-invite uses the same mechanism as reset-password — a fresh
    // temporary password with `mustChangePassword: true`. Different audit
    // entry would require an extra action enum; reuse for now.
    const { user, temporaryPassword } = await this.adminOrg.adminResetUserPassword(
      id,
      userId,
    );
    return { user: user.toPublic(), temporaryPassword };
  }

  @Patch(':id/users/:userId')
  async updateUser(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() body: AdminUpdateUserDto,
  ) {
    const user = await this.adminOrg.adminUpdateUser(id, userId, {
      role: body.role,
      firstName: body.firstName?.trim(),
      lastName: body.lastName?.trim(),
      isActive: body.isActive,
    });
    return user.toPublic();
  }
}
