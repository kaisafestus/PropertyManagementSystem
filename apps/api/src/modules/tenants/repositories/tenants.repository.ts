import { Injectable } from '@nestjs/common';
import { Prisma, Tenant } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';

@Injectable()
export class TenantsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.TenantCreateInput): Promise<Tenant> {
    return this.prisma.tenant.create({ data });
  }

  findAll(organizationId: string) {
    return this.prisma.tenant.findMany({
      where: { user: { organizationId } },
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });
  }

  findById(id: string) {
    return this.prisma.tenant.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  findByUserId(userId: string) {
    return this.prisma.tenant.findUnique({
      where: { userId },
      include: { user: true },
    });
  }

  update(id: string, data: Prisma.TenantUpdateInput): Promise<Tenant> {
    return this.prisma.tenant.update({ where: { id }, data });
  }

  remove(id: string): Promise<Tenant> {
    return this.prisma.tenant.delete({ where: { id } });
  }
}
