/**
 * Result returned from a successful bulk import — UI shows these counts
 * in the success card after the upload completes.
 */
export interface BulkImportSummary {
  categories: EntityCount;
  warehouses: EntityCount;
  suppliers: EntityCount;
  articles: EntityCount;
}

export interface EntityCount {
  created: number;
  skipped: number;
}

/**
 * One per-cell error returned to the client when the import fails validation.
 * Sheet names match what the user sees in Excel (Croatian); row numbers
 * are 1-based and include the header row (so the first data row is row 2).
 */
export interface RowError {
  sheet: string;
  row: number;
  field: string;
  message: string;
}
