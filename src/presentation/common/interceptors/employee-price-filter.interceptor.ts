import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { AuthContext } from '../../../domain/common/auth-context';
import { Role } from '../../../domain/common/role';

const FIELDS_TO_STRIP = new Set([
  'purchasePrice',
  'lineTotal',
  'totalValue',
]);

/**
 * Recursively strips cost-related fields from responses when the current
 * user has role EMPLOYEE. Mirrors the client-side hidings so the cost data
 * never leaves the server for employees.
 *
 * Stripped fields:
 *   - `purchasePrice` (Article, ProcurementItem)
 *   - `lineTotal`     (ProcurementItem — qty × purchasePrice)
 *   - `totalValue`    (Procurement aggregate, warehouse summary)
 *
 * Sale fields like `unitPrice` and `totalRevenue` are NOT stripped — those
 * reflect what the employee actually sold to the customer.
 *
 * Runs AFTER `TransformDecimalInterceptor`, so values are already strings.
 */
@Injectable()
export class EmployeePriceFilterInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<{ user?: AuthContext }>();
    const role = req.user?.role;
    if (role !== Role.EMPLOYEE) {
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
