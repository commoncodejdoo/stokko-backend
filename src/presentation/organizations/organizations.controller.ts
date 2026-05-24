import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { Organization } from '../../domain/organizations/organization.domain';
import { OrganizationsService } from '../../domain/organizations/organizations.service';
import type { AuthContext } from '../../domain/common/auth-context';
import { Role } from '../../domain/common/role';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';
import { Roles } from '../common/auth/roles.decorator';
import { RolesGuard } from '../common/auth/roles.guard';
import { UpdateOrgSettingsDto } from './organizations.dto';

@Controller('organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrganizationsController {
  constructor(private readonly orgs: OrganizationsService) {}

  @Get('me')
  async getMine(@CurrentUser() ctx: AuthContext) {
    const org = await this.orgs.requireById(ctx.organizationId);
    return this.toPublic(org);
  }

  @Patch('me')
  @Roles(Role.OWNER)
  async updateMine(
    @Body() body: UpdateOrgSettingsDto,
    @CurrentUser() ctx: AuthContext,
  ) {
    const updated = await this.orgs.updateSettings(
      ctx.organizationId,
      { priceTrackingEnabled: body.priceTrackingEnabled },
      ctx,
    );
    return this.toPublic(updated);
  }

  private toPublic(org: Organization) {
    return {
      id: org.id,
      name: org.name,
      currency: org.currency,
      priceTrackingEnabled: org.priceTrackingEnabled,
    };
  }
}
