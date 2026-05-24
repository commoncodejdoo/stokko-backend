import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { AuthContext } from '../../../domain/common/auth-context';

const FIELDS_TO_STRIP = new Set([
  'purchasePrice',
  'salePrice',
  'unitPrice',
  'lineTotal',
  'totalValue',
  'totalRevenue',
  'revenue',
  'estimatedPriceCents',
]);

/**
 * Strips cost/revenue fields from responses when the current org has
 * `priceTrackingEnabled === false`. Cross-role: kicks in regardless of
 * whether the user is OWNER, ADMIN, or EMPLOYEE.
 *
 * Orthogonal to `EmployeePriceFilterInterceptor`:
 *   - Employee filter: strips cost-only fields for EMPLOYEE role.
 *   - Price-tracking filter: strips ALL cost + revenue fields when the
 *     org has disabled price tracking entirely.
 *
 * `currency` is intentionally preserved — used by UI placeholders.
 * Runs AFTER `TransformDecimalInterceptor` so values are already strings.
 */
@Injectable()
export class PriceTrackingFilterInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<{ user?: AuthContext }>();
    const enabled = req.user?.priceTrackingEnabled;
    // If unset (unauthenticated route or token without org), don't strip.
    if (enabled !== false) {
      return next.handle();
    }
    return next.handle().pipe(map((data) => this.strip(data)));
  }

  private strip(value: unknown): unknown {
    if (value === null || value === undefined) return value;
    if (typeof value !== 'object') return value;
    if (Buffer.isBuffer(value)) return value;
    if (value instanceof StreamableFile) return value;
    if (value instanceof Date) return value;
    if (Array.isArray(value)) return value.map((v) => this.strip(v));

    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (FIELDS_TO_STRIP.has(k)) continue;
      out[k] = this.strip(v);
    }
    return out;
  }
}
