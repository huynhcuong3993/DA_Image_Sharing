import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  //   Lưu key vào Redis
  async setKey(key: string, value: any, ttl: number): Promise<void> {
    await this.cacheManager.set(key, JSON.stringify(value),ttl );
  }


  //   Lấy key từ Redis
  async getKey(key: string): Promise<any | null> {
    // console.log('  Fetching from Redis:', key);
    const rawValue = await this.cacheManager.get(key);
    // console.log('  Redis Value:', rawValue);
    return rawValue ? JSON.parse(rawValue as string) : null;
  }

  //   Xóa key trong Redis
  async deleteKey(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  //   Kiểm tra key có tồn tại không
  async keyExists(key: string): Promise<boolean> {
    const value = await this.cacheManager.get(key);
    return value !== null;
  }

  //   Lưu user vào Redis
  async setUser(clerkId: string, userData: any): Promise<void> {
    await this.cacheManager.set(`user:${clerkId}`, JSON.stringify(userData),1);
  }

  //   Lấy user từ Redis
  async getUser(clerkId: string): Promise<any | null> {
    const cachedUser = await this.cacheManager.get(`user:${clerkId}`);
    return cachedUser ? JSON.parse(cachedUser as string) : null;
  }
}
