import { Injectable } from '@nestjs/common';
import { Organization, Prisma, PrismaClient } from '@prisma/client';

import { PrismaService } from '../../../database/prisma/prisma.service';

@Injectable()
export class OrganizationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    data: Prisma.OrganizationCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Organization> {
    const client: PrismaClient | Prisma.TransactionClient = tx ?? this.prisma;

    return client.organization.create({
      data,
    });
  }
}
