import { Injectable } from '@nestjs/common';
import { Prisma, Unit } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';

@Injectable()
export class UnitsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.UnitCreateInput): Promise<Unit> {
    return this.prisma.unit.create({ data });
  }

  findAll() {
    return this.prisma.unit.findMany({
      orderBy: { createdAt: 'desc' },
      include: { property: true },
    });
  }

  findByProperty(propertyId: string) {
    return this.prisma.unit.findMany({
      where: { propertyId },
      orderBy: { unitNumber: 'asc' },
      include: { property: true },
    });
  }

  findById(id: string) {
    return this.prisma.unit.findUnique({
      where: { id },
      include: { property: true },
    });
  }

  update(id: string, data: Prisma.UnitUpdateInput): Promise<Unit> {
    return this.prisma.unit.update({ where: { id }, data });
  }

  remove(id: string): Promise<Unit> {
    return this.prisma.unit.delete({ where: { id } });
  }
}
