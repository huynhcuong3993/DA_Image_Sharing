import { Controller, Post, Body, Headers, Inject, forwardRef } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UsersService } from '../users/users.service';
@Controller('clerk')
export class ClerkController {
    constructor(
        @Inject(forwardRef(() => UsersService)) private readonly userService: UsersService
      ) {}
    
      @Post('webhook')
      async handleClerkWebhook(
        @Headers('clerk-signature') signature: string, // Xác thực webhook nếu cần
        @Body() data: any
      ) {
        console.log('Webhook received:', data);
    
        if (data.type === 'user.created') {
          const userData = {
            clerkId: data.data.id,
            email: data.data.email_addresses[0]?.email_address,
            username: data.data.username || data.data.first_name,
            firstName: data.data.first_name,
            lastName: data.data.last_name,
            avatar: data.data.image_url,
          };
    
          // Gửi đến UserController để lưu user
          await this.userService.findOrCreateUser(userData);
        }
    
        return { message: 'Webhook processed' };
      }
}
