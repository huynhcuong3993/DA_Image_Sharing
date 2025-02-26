import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ImageService } from './images.service';
import { ImageController } from './images.controller';
import { Image, ImageSchema }from './schema/images.schema';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UsersModule } from 'src/users/users.module';
import { CollectionModule } from '../collection/collection.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { Notification, NotificationSchema } from '../notifications/schemas/notification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Image.name, schema: ImageSchema }, { name: Notification.name, schema: NotificationSchema },]),
    CloudinaryModule,
    UsersModule,
    NotificationsModule,
    forwardRef(() => CollectionModule), 
    CacheModule.register({
      store: redisStore,
      host: 'localhost',
      port: 6379,
      ttl: 600,
    }),
  ],
  controllers: [ImageController],
  providers: [ImageService,  CloudinaryService],
  exports: [MongooseModule],
})
export class ImagesModule {}
