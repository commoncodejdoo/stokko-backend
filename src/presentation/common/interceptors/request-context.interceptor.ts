import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthContext } from '../../../domain/common/auth-context';
import { runWithRequestContext } from '../../../domain/common/request-context';

/**
 * Wraps every request in an `AsyncLocalStorage` scope so downstream
 * services (notably `AuditLogService`) can detect a platform-admin
 * impersonation session without each call site threading the context
 * through.
 *
 * Runs after the auth guards have populated `req.user`, so
 * `impersonatedBy` reflects the claim on the JWT used for this request.
 */
@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<{ user?: AuthContext }>();
    const impersonatedBy = req.user?.impersonatedBy ?? null;
    return new Observable((subscriber) => {
      runWithRequestContext({ impersonatedBy }, () => {
        next.handle().subscribe({
          next: (value) => subscriber.next(value),
          error: (err) => subscriber.error(err),
          complete: () => subscriber.complete(),
        });
      });
    });
  }
}
