import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainError } from '../../../domain/common/errors';

interface ErrorBody {
  statusCode: number;
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
  path: string;
}

/**
 * Unified error shape for every response.
 *
 * Maps:
 *  - DomainError → uses statusCode + code + details from the instance
 *  - class-validator BadRequest → VALIDATION_ERROR with fieldErrors[]
 *  - HttpException → status + mapped code + message
 *  - anything else → 500 INTERNAL_SERVER_ERROR (logs the stack)
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const body = this.toErrorBody(exception, request);

    if (body.statusCode >= 500) {
      this.logger.error(
        `[${body.code}] ${body.message} ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(`[${body.code}] ${body.message} ${request.method} ${request.url}`);
    }

    response.status(body.statusCode).json(body);
  }

  private toErrorBody(exception: unknown, request: Request): ErrorBody {
    const base = {
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (exception instanceof DomainError) {
      return {
        ...base,
        statusCode: exception.statusCode,
        code: exception.code,
        message: exception.message,
        details: exception.details,
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const resp = exception.getResponse();

      // class-validator + ValidationPipe returns { message: string[], error, statusCode }
      if (
        status === HttpStatus.BAD_REQUEST &&
        typeof resp === 'object' &&
        resp !== null &&
        Array.isArray((resp as Record<string, unknown>).message)
      ) {
        const messages = (resp as Record<string, unknown>).message as string[];
        return {
          ...base,
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: {
            fieldErrors: messages.map((m) => ({
              field: this.extractFieldFromMessage(m),
              code: m,
            })),
          },
        };
      }

      const message =
        typeof resp === 'string'
          ? resp
          : (((resp as Record<string, unknown>)?.message as string | undefined) ??
            exception.message);

      return {
        ...base,
        statusCode: status,
        code: this.statusToCode(status),
        message,
      };
    }

    return {
      ...base,
      statusCode: 500,
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error',
    };
  }

  private statusToCode(status: number): string {
    const map: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
      503: 'SERVICE_UNAVAILABLE',
    };
    return map[status] ?? `HTTP_${status}`;
  }

  private extractFieldFromMessage(message: string): string {
    // class-validator default format: "<field> must/should be ..."
    const match = message.match(/^(\w+)\s/);
    return match?.[1] ?? 'unknown';
  }
}
