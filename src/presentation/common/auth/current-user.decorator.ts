import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { AuthContext } from '../../../domain/common/auth-context';

/**
 * Injects the authenticated user's `AuthContext` into the controller method.
 *
 * Requires `@UseGuards(JwtAuthGuard)` to populate `req.user`.
 *
 * @example
 *   @UseGuards(JwtAuthGuard)
 *   @Get('me')
 *   me(@CurrentUser() ctx: AuthContext) { ... }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthContext => {
    const req = ctx.switchToHttp().getRequest<{ user?: AuthContext }>();
    if (!req.user) {
      throw new Error('CurrentUser used without JwtAuthGuard');
    }
    return req.user;
  },
);
