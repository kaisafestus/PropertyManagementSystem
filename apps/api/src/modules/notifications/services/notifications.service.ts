import { Injectable, NotFoundException } from '@nestjs/common';
import { NotificationsRepository } from '../repositories/notifications.repository';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { UpdateNotificationDto } from '../dto/update-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly notificationsRepository: NotificationsRepository,
  ) {}

  create(createNotificationDto: CreateNotificationDto) {
    return this.notificationsRepository.create({
      user: { connect: { id: createNotificationDto.userId } },
      title: createNotificationDto.title,
      message: createNotificationDto.message,
      isRead: createNotificationDto.isRead || false,
    });
  }

  findAll() {
    return this.notificationsRepository.findAll();
  }

  findByUser(userId: string) {
    return this.notificationsRepository.findByUser(userId);
  }

  findUnread(userId: string) {
    return this.notificationsRepository.findUnread(userId);
  }

  async findById(id: string) {
    const notification = await this.notificationsRepository.findById(id);
    if (!notification)
      throw new NotFoundException(`Notification with ID ${id} not found`);
    return notification;
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto) {
    await this.findById(id);
    return this.notificationsRepository.update(id, {
      title: updateNotificationDto.title,
      message: updateNotificationDto.message,
      isRead: updateNotificationDto.isRead,
    });
  }

  async markAsRead(id: string) {
    await this.findById(id);
    return this.notificationsRepository.markAsRead(id);
  }

  async remove(id: string) {
    await this.findById(id);
    return this.notificationsRepository.remove(id);
  }
}
