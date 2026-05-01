"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var GlobalExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const errors_1 = require("../../../domain/common/errors");
let GlobalExceptionFilter = GlobalExceptionFilter_1 = class GlobalExceptionFilter {
    logger = new common_1.Logger(GlobalExceptionFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const body = this.toErrorBody(exception, request);
        if (body.statusCode >= 500) {
            this.logger.error(`[${body.code}] ${body.message} ${request.method} ${request.url}`, exception instanceof Error ? exception.stack : undefined);
        }
        else {
            this.logger.warn(`[${body.code}] ${body.message} ${request.method} ${request.url}`);
        }
        response.status(body.statusCode).json(body);
    }
    toErrorBody(exception, request) {
        const base = {
            timestamp: new Date().toISOString(),
            path: request.url,
        };
        if (exception instanceof errors_1.DomainError) {
            return {
                ...base,
                statusCode: exception.statusCode,
                code: exception.code,
                message: exception.message,
                details: exception.details,
            };
        }
        if (exception instanceof common_1.HttpException) {
            const status = exception.getStatus();
            const resp = exception.getResponse();
            if (status === common_1.HttpStatus.BAD_REQUEST &&
                typeof resp === 'object' &&
                resp !== null &&
                Array.isArray(resp.message)) {
                const messages = resp.message;
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
            const message = typeof resp === 'string'
                ? resp
                : (resp?.message ??
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
    statusToCode(status) {
        const map = {
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
    extractFieldFromMessage(message) {
        const match = message.match(/^(\w+)\s/);
        return match?.[1] ?? 'unknown';
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = GlobalExceptionFilter_1 = __decorate([
    (0, common_1.Catch)()
], GlobalExceptionFilter);
//# sourceMappingURL=global-exception.filter.js.map