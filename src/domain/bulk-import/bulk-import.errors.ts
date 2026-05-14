import { DomainError } from '../common/errors';
import { RowError } from './bulk-import.types';

/**
 * Thrown when one or more rows in the uploaded Excel fail validation.
 * GlobalExceptionFilter maps this to 422 with the full `errors` list in
 * `details`, so the client dialog can render a row-by-row error report.
 */
export class BulkImportValidationError extends DomainError {
  readonly statusCode = 422;
  readonly code = 'BULK_IMPORT_VALIDATION_FAILED';

  constructor(errors: RowError[]) {
    super(`${errors.length} row${errors.length === 1 ? '' : 's'} failed validation`, {
      errors,
    });
  }
}

/**
 * Thrown for top-level issues with the uploaded file itself —
 * wrong format, unreadable, missing required sheets.
 */
export class BulkImportFileError extends DomainError {
  readonly statusCode = 400;
  readonly code = 'BULK_IMPORT_FILE_INVALID';
}
