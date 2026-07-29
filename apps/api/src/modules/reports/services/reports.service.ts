import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { MaintenanceStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(organizationId: string) {
    const totalProperties = await this.prisma.property.count({
      where: { organizationId },
    });

    const totalUnits = await this.prisma.unit.count({
      where: { property: { organizationId } },
    });

    const occupiedUnits = await this.prisma.unit.count({
      where: { property: { organizationId }, vacant: false },
    });

    const totalTenants = await this.prisma.tenant.count({
      where: { user: { organizationId } },
    });

    const openMaintenance = await this.prisma.maintenanceRequest.count({
      where: { property: { organizationId }, status: { not: 'COMPLETED' } },
    });

    const invoices = await this.prisma.invoice.findMany({
      where: { property: { organizationId } },
      select: { totalAmount: true, status: true },
    });

    let totalRevenue = 0;
    let outstandingAmount = 0;

    invoices.forEach((inv) => {
      const amount = Number(inv.totalAmount);
      if (inv.status === 'PAID' || inv.status === 'PARTIAL') {
        totalRevenue += amount;
      }
      if (inv.status === 'SENT' || inv.status === 'OVERDUE') {
        outstandingAmount += amount;
      }
    });

    return {
      properties: {
        total: totalProperties,
        units: totalUnits,
        occupied: occupiedUnits,
        vacancyRate:
          totalUnits > 0
            ? (((totalUnits - occupiedUnits) / totalUnits) * 100).toFixed(1)
            : 0,
      },
      tenants: {
        total: totalTenants,
      },
      maintenance: {
        open: openMaintenance,
      },
      financial: {
        totalRevenue,
        outstandingAmount,
        collectionRate:
          totalRevenue + outstandingAmount > 0
            ? (
                (totalRevenue / (totalRevenue + outstandingAmount)) *
                100
              ).toFixed(1)
            : 100,
      },
    };
  }

  async getFinancialReport(
    organizationId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const invoices = await this.prisma.invoice.findMany({
      where: {
        property: { organizationId },
        createdAt: { gte: startDate, lte: endDate },
      },
      include: { payments: true, tenant: true },
    });

    let totalBilled = 0;
    let totalPaid = 0;
    let totalOverdue = 0;

    invoices.forEach((inv) => {
      const amount = Number(inv.totalAmount);
      totalBilled += amount;

      const paid = inv.payments
        .filter((p) => p.status === 'PAID')
        .reduce((sum, p) => sum + Number(p.amount), 0);
      totalPaid += paid;

      if (inv.status === 'OVERDUE') {
        totalOverdue += amount - paid;
      }
    });

    return {
      period: { startDate, endDate },
      summary: {
        totalBilled,
        totalPaid,
        totalOverdue,
        collectionRate:
          totalBilled > 0 ? ((totalPaid / totalBilled) * 100).toFixed(1) : 100,
      },
      invoices: invoices.map((inv) => ({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        tenant: inv.tenant ? inv.tenant.userId : 'Unknown',
        amount: inv.totalAmount,
        paid: inv.payments
          .filter((p) => p.status === 'PAID')
          .reduce((sum, p) => sum + Number(p.amount), 0),
        status: inv.status,
      })),
    };
  }

  async getMaintenanceReport(
    organizationId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const requests = await this.prisma.maintenanceRequest.findMany({
      where: {
        property: { organizationId },
        createdAt: { gte: startDate, lte: endDate },
      },
      include: { property: true, vendor: true },
    });

    const byStatus: Record<string, number> = {};
    let totalCost = 0;

    requests.forEach((req) => {
      const status = req.status as string;
      byStatus[status] = (byStatus[status] || 0) + 1;
      if (req.cost) totalCost += Number(req.cost);
    });

    return {
      period: { startDate, endDate },
      summary: {
        total: requests.length,
        byStatus,
        totalCost,
        averageCost:
          requests.length > 0 ? (totalCost / requests.length).toFixed(2) : 0,
      },
      requests,
    };
  }

  async getOccupancyReport(organizationId: string) {
    const properties = await this.prisma.property.findMany({
      where: { organizationId },
      include: { units: true },
    });

    return properties.map((property) => {
      const total = property.units.length;
      const occupied = property.units.filter((u) => !u.vacant).length;
      return {
        propertyId: property.id,
        propertyName: property.name,
        totalUnits: total,
        occupiedUnits: occupied,
        vacancyRate:
          total > 0 ? (((total - occupied) / total) * 100).toFixed(1) : 100,
      };
    });
  }
}
