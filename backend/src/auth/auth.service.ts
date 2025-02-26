import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { RedisService } from '../redis/redis.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(private redisService: RedisService, private userService: UsersService) {}

  async generateJwt(user: any): Promise<string> {
    const payload = { sub: user.id, email: user.email };
    const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '10s' }); //   Token sống 10s

    console.log("  Token mới:", jwtToken);
    await this.redisService.setKey(`jwt:${user.id}`, jwtToken, 10); //   Lưu Redis 10s
    return jwtToken;
  }

  async validateToken(token: string): Promise<any> {
    try {
      const publicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzKOiOahytABtK0+mEHcb
i2v3Jr/aeYfoG0sC/O44OjzjC5XK0+MwNMP4BsNXvgYb/nYZEDKgNZV1F1C/P5Ln
zQiuZZIvj495/65/lsyjYkP96CBX36wl6q3dE7P0259inDTdMzLqbCvcL7Wk+q04
vNWn6zQuCh+elHDpwOGih3ahRh4shNkNCE7axNC3goDClCuYgmRvonEteCztKEAv
voUUuWdN+6g/V2IUlcyW1dTS0b3v3PNa42ff792Qnb3a3U7dkwzjROZ97PxQDX87
QZ7+Xkmn4F3yZ+m3huYGOlmXfmL+KHIj0zyXVVPiu0VELpiKWevU32l1EZe1M/qK
owIDAQAB
-----END PUBLIC KEY-----`;

      const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
      console.log("  Token hợp lệ:", decoded);

      const redisToken = await this.redisService.getKey(`jwt:${decoded.sub}`);

      console.log("  Token từ Redis:", redisToken);
      console.log("  Token từ request:", decoded);

      // if (!redisToken || redisToken !== token) {
      //   throw new UnauthorizedException('Token expired or invalid');
      // }
      return decoded;
    } catch (error) {
      console.error("  Token không hợp lệ:", error.message);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
