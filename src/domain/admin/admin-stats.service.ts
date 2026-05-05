import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../data/common/prisma/prisma.service';

export interface PlatformStats {
  totalOrgs: number;
  activeOrgs: number;
  totalUsers: number;
  orgsLast30Days: number;
}

@Injectable()
export class AdminStatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(): Promise<PlatformStats> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);

    const [totalOrgs, activeOrgs, totalUsers, orgsLast30Days] = await Promise.all([
      this.prisma.organization.count(),
      this.prisma.organization.count({ where: { isActive: true } }),
      this.prisma.user.count(),
      this.prisma.organization.count({ where: { createdAt: { gte: cutoff } } }),
    ]);

    return { totalOrgs, activeOrgs, totalUsers, orgsLast30Days };
  }
}
