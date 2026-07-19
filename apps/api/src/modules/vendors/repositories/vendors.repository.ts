import { Injectable } from '@nestjs/common';
import { Prisma, Vendor } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';

@Injectable()
export class VendorsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.VendorCreateInput): Promise<Vendor> {
    return this.prisma.vendor.create({ data });
  }

  findAll() {
    return this.prisma.vendor.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });
  }

  findById(id: string) {
    return this.prisma.vendor.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  findByUserId(userId: string) {
    return this.prisma.vendor.findUnique({
      where: { userId },
      include: { user: true },
    });
  }

  update(id: string, data: Prisma.VendorUpdateInput): Promise<Vendor> {
    return this.prisma.vendor.update({ where: { id }, data });
  }

  remove(id: string): Promise<Vendor> {
    return this.prisma.vendor.delete({ where: { id } });
  }
}
