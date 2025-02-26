import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './modules/products/product.module';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ImagesModule } from './modules/images/images.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { RedisModule } from './redis/redis.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from "./admin/admin.module";
import { AdminUsersModule } from "./admin/users/admin-users.module";
import { AdminReportsModule } from "./admin/reports/admin-reports.module";
import { AdminPostsModule } from "./admin/posts/admin-posts.module";
import { CollectionModule } from './modules/collection/collection.module';
import { InteractionModule } from './modules/interaction/interaction.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
@Module({
  imports: [
    ProductModule,
    UsersModule,
    ConfigModule.forRoot({isGlobal: true,}),
    // CacheModule.register({isGlobal: true}),
    EventEmitterModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: 'localhost', // Redis server host
      port: 6379,        // Redis server port
      ttl: 10000,         // Time-to-live in milliseconds (optional)
    }),
    
    AuthModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    
    ImagesModule,
    CollectionModule,
    InteractionModule,
    
    CloudinaryModule,
    AdminModule,
    AdminUsersModule,
    AdminPostsModule,
    AdminReportsModule,
    NotificationsModule,

],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
