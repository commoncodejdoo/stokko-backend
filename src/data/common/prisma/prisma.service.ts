import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Prisma client as a NestJS injectable.
 * Connection opens on module init and closes on shutdown.
 *
 * Accessed via `data/common/prisma/prisma.module` (a global @Module).
 * Repositories inject it through their constructor.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('Prisma client connected');
    } catch (err) {
      // Don't crash the process if the DB is unreachable at startup —
      // the /health endpoint will report it. Individual queries will
      // still throw their own errors.
      this.logger.warn(
        `Prisma initial connect failed: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Prisma client disconnected');
  }
}
