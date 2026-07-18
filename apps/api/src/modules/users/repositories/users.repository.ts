import { Injectable } from '@nestjs/common';
import { Prisma, PrismaClient, User } from '@prisma/client';

import { PrismaService } from '../../../database/prisma/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  create(
    data: Prisma.UserCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<User> {
    const client: PrismaClient | Prisma.TransactionClient = tx ?? this.prisma;

    return client.user.create({
      data,
    });
  }
}
