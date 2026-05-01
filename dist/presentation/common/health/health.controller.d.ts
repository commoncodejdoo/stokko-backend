import { PrismaService } from '../../../data/common/prisma/prisma.service';
export declare class HealthController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    health(): Promise<{
        status: 'ok' | 'degraded';
        uptime: number;
        timestamp: string;
        database: {
            status: 'ok' | 'down';
            latencyMs: number;
        };
    }>;
}
