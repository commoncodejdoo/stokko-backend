import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../../data/common/prisma/prisma.service';

/**
 * GET /api/v1/health
 *
 * Verifies that the app is alive and the DB is reachable.
 * Used as the Render health-check endpoint.
 */
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async health(): Promise<{
    status: 'ok' | 'degraded';
    uptime: number;
    timestamp: string;
    database: { status: 'ok' | 'down'; latencyMs: number };
  }> {
    const dbStart = Date.now();
    let dbStatus: 'ok' | 'down' = 'ok';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      dbStatus = 'down';
    }

    return {
      status: dbStatus === 'ok' ? 'ok' : 'degraded',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: { status: dbStatus, latencyMs: Date.now() - dbStart },
    };
  }
}
