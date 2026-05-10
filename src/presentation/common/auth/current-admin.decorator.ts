import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { AdminRequestContext } from './platform-admin.guard';

/**
 * Injects the authenticated platform admin's context into the controller
 * method. Requires `@UseGuards(PlatformAdminGuard)` to populate `req.admin`.
 */
export const CurrentAdmin = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AdminRequestContext => {
    const req = ctx.switchToHttp().getRequest<{ admin?: AdminRequestContext }>();
    if (!req.admin) {
      throw new Error('CurrentAdmin used without PlatformAdminGuard');
    }
    return req.admin;
  },
);
