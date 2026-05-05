import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminOrgService } from '../../domain/admin/admin-org.service';
import { PlatformAdminGuard } from '../common/auth/platform-admin.guard';
import { CreateOrgDto, PaginationDto, UpdateOrgDto } from './admin.dto';

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
      items: items.map(({ org, userCount }) => ({ ...org.toSnapshot(), userCount })),
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
    const { org, userCount } = await this.adminOrg.getOrg(id);
    return { ...org.toSnapshot(), userCount };
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
}
