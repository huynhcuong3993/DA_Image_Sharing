import { Controller, Get, Post, Delete, Param, Query, Body } from '@nestjs/common';
import { RedisService } from './redis.service';
import { time } from 'console';

@Controller('redis')
export class RedisController {
  constructor(private readonly redisService: RedisService) {}

  //   Lưu key vào Redis
  @Post('set')
  async setKey(@Body() body: { key: string; value: any , time: number}): Promise<string> {
    console.log(`Setting key: ${body.key} =>`, body.value);
    await this.redisService.setKey(body.key, body.value, body.time);
    return `Key "${body.key}" stored in Redis.`;
  }

  //   Lấy key từ Redis
  @Get('get')
  async getKey(@Query('key') key: string): Promise<any> {
    console.log(`Fetching key from Redis: ${key}`);
    return await this.redisService.getKey(key);
  }

  //   Xóa key trong Redis
  @Delete('delete')
  async deleteKey(@Query('key') key: string): Promise<string> {
    console.log(`Deleting key from Redis: ${key}`);
    await this.redisService.deleteKey(key);
    return `Key "${key}" deleted from Redis.`;
  }

  //   Kiểm tra key có tồn tại không
  @Get('exists')
  async keyExists(@Query('key') key: string): Promise<boolean> {
    console.log(`Checking if key exists in Redis: ${key}`);
    return await this.redisService.keyExists(key);
  }

  //   Lưu user vào Redis
  @Post('user')
  async setUser(@Body() body: { clerkId: string; userData: any }): Promise<string> {
    console.log(`Storing user ${body.clerkId} in Redis.`);
    await this.redisService.setUser(body.clerkId, body.userData);
    return `User "${body.clerkId}" stored in Redis.`;
  }

  //   Lấy user từ Redis
  @Get('user')
  async getUser(@Query('clerkId') clerkId: string): Promise<any> {
    console.log(`Fetching user ${clerkId} from Redis.`);
    return await this.redisService.getUser(clerkId);
  }
}
