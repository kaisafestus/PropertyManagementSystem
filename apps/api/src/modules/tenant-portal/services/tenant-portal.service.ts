import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/prisma/prisma.service';

@Injectable()
export class TenantPortalService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(userId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant profile not found');
    }

    const invoices = await this.prisma.invoice.findMany({
      where: { tenantId: tenant.id },
      include: { property: true, unit: true, payments: true },
      orderBy: { createdAt: 'desc' },
    });

    const maintenanceRequests = await this.prisma.maintenanceRequest.findMany({
      where: { tenantId: tenant.id },
      include: { property: true, unit: true, vendor: true },
      orderBy: { createdAt: 'desc' },
    });

    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const documentFilters: any[] = [
      { entityType: 'Tenant', entityId: tenant.id },
    ];

    if (invoices.length > 0) {
      const unitId = invoices[0]!.unitId;
      const propertyId = invoices[0]!.propertyId;
      if (unitId)
        documentFilters.push({ entityType: 'Unit', entityId: unitId });
      if (propertyId)
        documentFilters.push({ entityType: 'Property', entityId: propertyId });
    }

    const documents = await this.prisma.document.findMany({
      where: {
        OR: documentFilters,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    const totalPaid = invoices
      .filter((inv) => inv.status === 'PAID')
      .reduce((sum, inv) => sum + Number(inv.totalAmount), 0);

    const outstanding = invoices
      .filter(
        (inv) =>
          inv.status === 'SENT' ||
          inv.status === 'OVERDUE' ||
          inv.status === 'PARTIAL',
      )
      .reduce((sum, inv) => {
        const paid = inv.payments
          .filter((p) => p.status === 'PAID')
          .reduce((s, p) => s + Number(p.amount), 0);
        return sum + (Number(inv.totalAmount) - paid);
      }, 0);

    const openMaintenance = maintenanceRequests.filter(
      (r) => r.status === 'OPEN' || r.status === 'ASSIGNED',
    ).length;

    const inProgressMaintenance = maintenanceRequests.filter(
      (r) => r.status === 'IN_PROGRESS' || r.status === 'WAITING_PARTS',
    ).length;

    const completedMaintenance = maintenanceRequests.filter(
      (r) => r.status === 'COMPLETED',
    ).length;

    const nextDueInvoice = invoices.find(
      (inv) => inv.status === 'SENT' || inv.status === 'DRAFT',
    );

    const recentPayments = await this.prisma.payment.findMany({
      where: { tenantId: tenant.id },
      include: { invoice: true, property: true, unit: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return {
      tenant,
      outstandingBalance: outstanding,
      totalPaidThisYear: totalPaid,
      openMaintenance,
      inProgressMaintenance,
      completedMaintenance,
      nextDueInvoice,
      recentPayments,
      recentNotifications: notifications,
      recentDocuments: documents,
      recentMaintenance: maintenanceRequests.slice(0, 5),
    };
  }

  async getLease(userId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { userId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant profile not found');
    }

    const invoices = await this.prisma.invoice.findMany({
      where: { tenantId: tenant.id },
      include: { property: true, unit: true, payments: true },
      orderBy: { createdAt: 'desc' },
    });

    if (invoices.length === 0) {
      return {
        tenant,
        lease: null,
        property: null,
        unit: null,
      };
    }

    const latestInvoice = invoices[0]!;

    return {
      tenant,
      lease: {
        id: latestInvoice.id,
        invoiceNumber: latestInvoice.invoiceNumber,
        startDate: latestInvoice.issueDate,
        endDate: new Date(
          new Date(latestInvoice.issueDate).setFullYear(
            new Date(latestInvoice.issueDate).getFullYear() + 1,
          ),
        ),
        monthlyRent: Number(latestInvoice.amount),
        securityDeposit: Number(latestInvoice.amount) * 2,
        rentDueDate: latestInvoice.dueDate,
        status: 'ACTIVE',
        renewalStatus: 'NOT_DUE',
      },
      property: latestInvoice.property,
      unit: latestInvoice.unit,
    };
  }

  async getPayments(userId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { userId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant profile not found');
    }

    const invoices = await this.prisma.invoice.findMany({
      where: { tenantId: tenant.id },
      include: { property: true, unit: true, payments: true },
      orderBy: { createdAt: 'desc' },
    });

    const payments = await this.prisma.payment.findMany({
      where: { tenantId: tenant.id },
      include: { invoice: true, property: true, unit: true },
      orderBy: { createdAt: 'desc' },
    });

    const totalPaid = payments
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const outstanding = invoices
      .filter((inv) => inv.status !== 'PAID')
      .reduce((sum, inv) => {
        const paid = inv.payments
          .filter((p) => p.status === 'PAID')
          .reduce((s, p) => s + Number(p.amount), 0);
        return sum + (Number(inv.totalAmount) - paid);
      }, 0);

    return {
      invoices,
      payments,
      totalPaid,
      outstandingBalance: outstanding,
    };
  }

  async getMaintenance(userId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { userId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant profile not found');
    }

    const requests = await this.prisma.maintenanceRequest.findMany({
      where: { tenantId: tenant.id },
      include: { property: true, unit: true, vendor: true },
      orderBy: { createdAt: 'desc' },
    });

    return {
      requests,
      open: requests.filter((r) => r.status === 'OPEN').length,
      inProgress: requests.filter(
        (r) => r.status === 'IN_PROGRESS' || r.status === 'WAITING_PARTS',
      ).length,
      completed: requests.filter((r) => r.status === 'COMPLETED').length,
    };
  }

  async getDocuments(userId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { userId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant profile not found');
    }

    const invoices = await this.prisma.invoice.findMany({
      where: { tenantId: tenant.id },
      select: { unitId: true, propertyId: true },
      take: 1,
    });

    const unitId = invoices[0]?.unitId;
    const propertyId = invoices[0]?.propertyId;

    const documents = await this.prisma.document.findMany({
      where: {
        OR: [
          { entityType: 'Tenant', entityId: tenant.id },
          { entityType: 'Unit', entityId: unitId || '' },
          { entityType: 'Property', entityId: propertyId || '' },
        ],
      },
      include: { uploader: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return { documents };
  }

  async getNotices(userId: string) {
    const notices = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return { notices };
  }

  async getMessages(userId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return { messages: notifications };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { userId },
    });

    let unit = null;
    let property = null;
    let lease = null;

    if (tenant) {
      const invoice = await this.prisma.invoice.findFirst({
        where: { tenantId: tenant.id },
        include: { property: true, unit: true },
      });

      if (invoice) {
        unit = invoice.unit;
        property = invoice.property;
        lease = {
          invoiceNumber: invoice.invoiceNumber,
          status: invoice.status,
        };
      }
    }

    return {
      user,
      tenant,
      unit,
      property,
      lease,
    };
  }

  async updateProfile(userId: string, data: { phone?: string }) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { phone: data.phone },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
      },
    });

    return user;
  }

  async createMaintenanceRequest(
    userId: string,
    data: {
      title: string;
      description: string;
      priority?: string;
    },
  ) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { userId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant profile not found');
    }

    const invoices = await this.prisma.invoice.findFirst({
      where: { tenantId: tenant.id },
    });

    if (!invoices) {
      throw new NotFoundException('No active lease found');
    }

    const request = await this.prisma.maintenanceRequest.create({
      data: {
        title: data.title,
        description: data.description,
        priority: (data.priority as any) || 'MEDIUM',
        status: 'OPEN',
        property: { connect: { id: invoices.propertyId } },
        unit: { connect: { id: invoices.unitId } },
        tenant: { connect: { id: tenant.id } },
      },
      include: { property: true, unit: true, vendor: true },
    });

    return request;
  }
}
