/**
 * Base class for every domain error.
 *
 * Every domain error must declare:
 * - `statusCode` — HTTP status returned by GlobalExceptionFilter
 * - `code` — SCREAMING_SNAKE_CASE machine-readable identifier
 *
 * Domain errors are not handled inside services — they are thrown and
 * caught by GlobalExceptionFilter, which maps them to the unified JSON shape.
 */
export abstract class DomainError extends Error {
  abstract readonly statusCode: number;
  abstract readonly code: string;

  constructor(
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
