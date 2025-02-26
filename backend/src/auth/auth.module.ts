import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import * as redisStore from 'cache-manager-redis-store';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisService } from 'src/redis/redis.service';
import { AuthMiddleware } from 'src/auth-middleware/auth-middleware.middleware';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.CLERK_JWT_SECRET,
      signOptions: { expiresIn: '10m' },
    }),
    UsersModule,
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      ttl: 1800, // Cache 30 phút
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy,RedisService],
  exports: [AuthService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {

    consumer.apply(AuthMiddleware).forRoutes('*'); // Áp dụng cho tất cả route
  }
}

