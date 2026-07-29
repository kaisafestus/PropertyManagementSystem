import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getSystemStats() {
    const [totalUsers, totalProperties, totalTenants, totalVendors] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.property.count(),
        this.prisma.tenant.count(),
        this.prisma.vendor.count(),
      ]);

    const recentUsers = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return {
      stats: {
        users: totalUsers,
        properties: totalProperties,
        tenants: totalTenants,
        vendors: totalVendors,
      },
      recentUsers,
    };
  }

  async getUserGrowth() {
    const users = await this.prisma.user.findMany({
      select: { createdAt: true },
    });

    const dateMap = new Map<string, number>();

    for (const user of users) {
      const dateParts = user.createdAt.toISOString().split('T');
      const date: string = dateParts[0] || '';
      if (date) {
        const current: number = dateMap.get(date) ?? 0;
        dateMap.set(date, current + 1);
      }
    }

    const growth: { date: string; count: number }[] = [];
    for (const [date, count] of dateMap.entries()) {
      growth.push({ date, count });
    }

    return growth;
  }

  async getSystemHealth() {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date(),
      database: 'connected',
    };
  }
}
