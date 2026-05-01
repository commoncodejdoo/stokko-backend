import type { Prisma } from '@prisma/client';

/**
 * Opaque transaction context.
 *
 * Explicit tx propagation pattern: when a service runs inside a Prisma
 * `$transaction`, the caller passes a tx argument; downstream services
 * and repositories propagate it (and use it instead of `this.prisma`).
 *
 * The Prisma type is imported here type-only so the domain stays free of
 * any runtime Prisma dependency. If the ORM is ever swapped, this is the
 * single point that has to change.
 */
export type TxClient = Prisma.TransactionClient;
