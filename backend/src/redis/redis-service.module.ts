import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisService } from './redis.service';

@Module({
  imports: [CacheModule.register()], 
  providers: [RedisService],
  exports: [RedisService], // Export RedisService so it can be used in other modules
})
export class RedisServiceModule {}