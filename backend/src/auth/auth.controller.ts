import { Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  @Post('login')
  async login(@Req() req: Request, @Res() res: Response) {
    const { token } = req.body;
    // console.log(token);
    if (!token) {
      return res.status(400).json({ message: 'Missing token' });
    }

    res.cookie('Authentication', token, {
    httpOnly: true,
    maxAge: 3000, 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

    return res.json({ message: 'Login successful' });
  }
}
