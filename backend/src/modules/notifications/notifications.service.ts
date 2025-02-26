import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from "../../users/users.service"; //   Import UserService
import { Notification, NotificationDocument } from './schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    private userService: UsersService //   Inject UserService
  ) {}

  async getUserNotificationsByClerkId(clerkId: string) {
    const user = await this.userService.findByClerkId(clerkId); //   Gọi hàm từ UserService
    if (!user) throw new Error("User not found!");
    return this.notificationModel
      .find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(20); //   Chỉ lấy 20 thông báo gần nhất
  }

  async markAllAsRead(clerkId: string) {
    const user = await this.userService.findByClerkId(clerkId); //   Gọi hàm từ UserService
    if (!user) throw new Error("User not found!");
    return this.notificationModel.updateMany({ userId: user._id, isRead: false }, { isRead: true });
  }
}
