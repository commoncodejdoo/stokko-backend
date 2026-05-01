/**
 * Helper for soft-delete filtering.
 *
 * Used in every repository for entities that have a `deletedAt` field
 * (Article, Category, Warehouse, Supplier).
 *
 * @example
 * this.prisma.article.findMany({
 *   where: { ...whereNotDeleted(), organizationId },
 * });
 */
export const whereNotDeleted = () => ({ deletedAt: null });
