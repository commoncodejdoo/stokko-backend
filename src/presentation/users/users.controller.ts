import { Controller, Get, NotFoundException, UseGuards } from '@nestjs/common';
import type { AuthContext } from '../../domain/common/auth-context';
import { OrganizationsService } from '../../domain/organizations/organizations.service';
import { UsersService } from '../../domain/users/users.service';
import { CurrentUser } from '../common/auth/current-user.decorator';
import { JwtAuthGuard } from '../common/auth/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly users: UsersService,
    private readonly orgs: OrganizationsService,
  ) {}

  /**
   * Returns the authenticated user + their organization.
   * Mobile calls this on app start to hydrate the auth-store user object.
   */
  @Get('me')
  async me(@CurrentUser() ctx: AuthContext) {
    const user = await this.users.findById(ctx.userId);
    const org = await this.orgs.findById(ctx.organizationId);
    if (!user || !org) throw new NotFoundException();
    return {
      user: user.toPublic(),
      organization: {
        id: org.id,
        name: org.name,
        currency: org.currency,
        priceTrackingEnabled: org.priceTrackingEnabled,
      },
    };
  }
}
