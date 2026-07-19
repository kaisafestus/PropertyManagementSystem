import { Injectable } from '@nestjs/common';
import { Prisma, Property } from '@prisma/client';

import { PrismaService } from '../../../database/prisma/prisma.service';

@Injectable()
export class PropertiesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.PropertyCreateInput): Promise<Property> {
    return this.prisma.property.create({
      data,
    });
  }

  findAll() {
    return this.prisma.property.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        organization: true,
        images: true,
        units: true,
      },
    });
  }

  findById(id: string) {
    return this.prisma.property.findUnique({
      where: { id },
      include: {
        organization: true,
        images: true,
        units: true,
      },
    });
  }

  update(id: string, data: Prisma.PropertyUpdateInput): Promise<Property> {
    return this.prisma.property.update({
      where: { id },
      data,
    });
  }
}
