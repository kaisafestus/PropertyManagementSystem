import { Injectable } from '@nestjs/common';
import { Prisma, MaintenanceRequest } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';

@Injectable()
export class MaintenanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    data: Prisma.MaintenanceRequestCreateInput,
  ): Promise<MaintenanceRequest> {
    return this.prisma.maintenanceRequest.create({
      data,
      include: { property: true, unit: true, tenant: true, vendor: true },
    });
  }

  findAll(organizationId: string) {
    return this.prisma.maintenanceRequest.findMany({
      where: { property: { organizationId } },
      orderBy: { createdAt: 'desc' },
      include: { property: true, unit: true, tenant: true, vendor: true },
    });
  }

  findByProperty(propertyId: string) {
    return this.prisma.maintenanceRequest.findMany({
      where: { propertyId },
      orderBy: { createdAt: 'desc' },
      include: { property: true, unit: true, tenant: true, vendor: true },
    });
  }

  findByVendor(vendorId: string) {
    return this.prisma.maintenanceRequest.findMany({
      where: { vendorId },
      orderBy: { createdAt: 'desc' },
      include: { property: true, unit: true, tenant: true, vendor: true },
    });
  }

  findByStatus(status: string) {
    return this.prisma.maintenanceRequest.findMany({
      where: { status: status as any },
      orderBy: { createdAt: 'desc' },
      include: { property: true, unit: true, tenant: true, vendor: true },
    });
  }

  findById(id: string) {
    return this.prisma.maintenanceRequest.findUnique({
      where: { id },
      include: { property: true, unit: true, tenant: true, vendor: true },
    });
  }

  update(
    id: string,
    data: Prisma.MaintenanceRequestUpdateInput,
  ): Promise<MaintenanceRequest> {
    return this.prisma.maintenanceRequest.update({
      where: { id },
      data,
      include: { property: true, unit: true, tenant: true, vendor: true },
    });
  }

  remove(id: string): Promise<MaintenanceRequest> {
    return this.prisma.maintenanceRequest.delete({ where: { id } });
  }
}
