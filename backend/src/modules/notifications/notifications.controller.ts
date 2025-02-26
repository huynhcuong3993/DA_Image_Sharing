import { Controller, Patch, Post, Body } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  async getNotifications(@Body("userId") userId: string) {
    console.log("User ID nhận được:", userId);
    return this.notificationsService.getUserNotificationsByClerkId(userId) || [];
  }
  @Patch("/read")
  async markNotificationsAsRead(@Body("userId") userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }
}
