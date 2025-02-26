import { Module,  } from '@nestjs/common';
import { RedisController } from './redis.controller';
import { RedisService } from './redis.service';
import { RedisServiceModule } from './redis-service.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  providers: [RedisService],
  controllers: [RedisController],
  imports: [RedisServiceModule, CacheModule.register()],
  exports: [RedisService],
})
export class RedisModule {}