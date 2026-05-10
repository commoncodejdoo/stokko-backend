import {
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthContext } from '../../../domain/common/auth-context';

/**
 * Blocks every non-GET request on a read-only impersonation session
 * (issued by the platform-admin `POST /admin/organizations/:id/impersonate`
 * endpoint). The flag is set on `req.user` by `JwtStrategy`.
 *
 * Registered globally so it covers every tenant route without per-controller
 * opt-in. Routes without `@UseGuards(JwtAuthGuard)` won't have `req.user`
 * populated, so they pass through untouched.
 */
@Injectable()
export class ReadOnlySessionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<{
      method?: string;
      user?: AuthContext;
    }>();
    if (req.user?.readOnly && req.method && req.method !== 'GET') {
      throw new ForbiddenException({
        code: 'READ_ONLY_SESSION',
        message: 'Ova sesija je samo za pregled (read-only).',
      });
    }
    return next.handle();
  }
}
