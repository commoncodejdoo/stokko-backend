import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  StreamableFile,
} from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { Observable, map } from 'rxjs';

/**
 * Converts `Decimal` instances (decimal.js and Prisma Decimal) into strings
 * during response serialization.
 *
 * Why: a `Decimal` in JSON naturally becomes a number, which loses precision.
 * String is the standard recommendation (Stripe, GitHub, etc.) and the
 * client can use `decimal.js` for arithmetic.
 *
 * Maps recursively through objects and arrays.
 */
@Injectable()
export class TransformDecimalInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map((data) => this.transform(data)));
  }

  private transform(value: unknown): unknown {
    if (value === null || value === undefined) return value;

    if (value instanceof Decimal) return value.toFixed();

    if (this.isPrismaDecimal(value)) {
      return (value as { toFixed: () => string }).toFixed();
    }

    if (value instanceof Date) return value.toISOString();

    // Don't walk into binary buffers / streams / StreamableFile — they
    // should pass through to the response unchanged. Without this guard,
    // `Object.entries(buf)` below would serialise the buffer byte-by-byte
    // into JSON, or expose a StreamableFile's internal `options` blob.
    if (Buffer.isBuffer(value)) return value;
    if (value instanceof StreamableFile) return value;
    if (
      typeof value === 'object' &&
      value !== null &&
      (Symbol.asyncIterator in value || 'pipe' in value)
    ) {
      return value;
    }

    if (Array.isArray(value)) return value.map((v) => this.transform(v));

    if (typeof value === 'object') {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        out[k] = this.transform(v);
      }
      return out;
    }

    return value;
  }

  private isPrismaDecimal(v: unknown): boolean {
    return (
      typeof v === 'object' &&
      v !== null &&
      'toFixed' in v &&
      typeof (v as { toFixed: unknown }).toFixed === 'function' &&
      'd' in v &&
      's' in v &&
      'e' in v
    );
  }
}
