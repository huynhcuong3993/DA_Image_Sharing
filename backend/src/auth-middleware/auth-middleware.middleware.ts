import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly redisService: RedisService) {}
  
  async use(req: Request, res: Response, next: NextFunction) {
    var authHeaderReal;
    const authHeader = req.body.token;
    const authHeader1 = req.headers.authorization;
    // console.log("authHeader" , authHeader);
    if(authHeader === undefined || authHeader === null){
      authHeaderReal = authHeader1 ? authHeader1.split(' ')[1] : null;
    }
    else{
      authHeaderReal = authHeader;
    }
    // console.log(authHeader1);
    // console.log(authHeader);
    if (!authHeaderReal) throw new UnauthorizedException('No token provided');

    const token =authHeaderReal; // Lấy token từ header
    // console.log(token);
    if (!authHeaderReal) throw new UnauthorizedException('Invalid token');

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
     // Lưu Token vào Redis với key duy nhất
     await this.redisService.setKey(`jwt:${decoded.sub}`, token, 60000);
      
     // Kiểm tra token trong Rediss
     const redisToken = await this.redisService.getKey(`jwt:${decoded.sub}`);
      if (!redisToken || redisToken !== token) {
        throw new UnauthorizedException('Token expired or invalid');
      }

      req['user'] = decoded.sub; // Gắn user vào request
      // console.log(req['user']);
      next();
    } catch (error) {
      console.error("Token không hợp lệ:", error.message);
      throw new UnauthorizedException('Invalid token');
    }
  }
}
