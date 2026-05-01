export declare abstract class DomainError extends Error {
    readonly details?: Record<string, unknown> | undefined;
    abstract readonly statusCode: number;
    abstract readonly code: string;
    constructor(message: string, details?: Record<string, unknown> | undefined);
}
