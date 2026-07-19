import { Injectable } from '@nestjs/common';
import { Prisma, Notification } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';

@Injectable()
export class NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.NotificationCreateInput): Promise<Notification> {
    return this.prisma.notification.create({
      data,
      include: { user: true },
    });
  }

  findAll() {
    return this.prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });
  }

  findByUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });
  }

  findUnread(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId, isRead: false },
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });
  }

  findById(id: string) {
    return this.prisma.notification.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  update(
    id: string,
    data: Prisma.NotificationUpdateInput,
  ): Promise<Notification> {
    return this.prisma.notification.update({
      where: { id },
      data,
      include: { user: true },
    });
  }

  markAsRead(id: string): Promise<Notification> {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
      include: { user: true },
    });
  }

  remove(id: string): Promise<Notification> {
    return this.prisma.notification.delete({ where: { id } });
  }
}
