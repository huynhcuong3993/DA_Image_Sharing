import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import fetch from 'node-fetch';

@Controller('proxy')
export class ProxyController {
  @Get('image')
  async getImage(@Query('url') url: string, @Res() res: Response) {
    try {
      const response = await fetch(url);
      const buffer = await response.buffer();
      res.setHeader('Content-Type', response.headers.get('content-type'));
      res.send(buffer);
    } catch (error) {
      res.status(500).json({ error: 'Không thể tải ảnh' });
    }
  }
}
