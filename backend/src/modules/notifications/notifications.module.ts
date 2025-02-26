import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './schemas/notification.schema';
import { UsersModule } from "../../users/users.module"; //   Import UserModule
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
    UsersModule,
  ],
  controllers: [NotificationsController],  //   Đảm bảo có Controller
  providers: [NotificationsService],
  exports: [MongooseModule], // Xuất module để các module khác có thể dùng
})
export class NotificationsModule {}
