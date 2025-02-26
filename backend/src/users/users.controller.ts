import { Controller, Delete, Get, Post, Body, Patch, Param, Req, Headers, NotFoundException, UnauthorizedException, BadRequestException, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import * as jwt from 'jsonwebtoken'; // Import JWT để decode token

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) { }

  // Middleware: Trích xuất userId từ token Clerk
  private extractUserIdFromToken(authHeader: string | undefined): string {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid token');
    }
    
    const token = authHeader.split(' ')[1]; // Lấy token từ Header
    try {
      const decoded: any = jwt.decode(token); // Giải mã token
      if (!decoded || !decoded.sub) {
        throw new UnauthorizedException('Invalid token');
      }
      return decoded.sub; // Clerk User ID
    } catch (error) {
      throw new UnauthorizedException('Token verification failed');
    }
  }

  @Get(':username')
  async getUserByUsername(@Param('username') username: string): Promise<{ _id: string }> {
      const user = await this.usersService.findByUsername(username);
      if (!user) {
          throw new NotFoundException('Không tìm thấy user!');
      }
      return { _id: user._id.toString() }; // Chuyển về string nếu cần
  }

  @Post('create')
  async createUser(@Body() userData: any) {
    console.log('create user')
    if (!userData.clerkId) {
      return { message: 'Missing clerkId' };
    }

    const user = await this.usersService.findOrCreateUser(userData);
    return { message: 'User saved successfully', user };
  }
  @Patch(':userId')
  async updateUser(@Param('userId') userId: string, @Body() updateData: UpdateUserDto) {
    console.log("controller" , userId)
    return this.usersService.updateUser(userId, updateData);
  }


  // API: Theo dõi người dùng (sử dụng token Clerk để xác thực)
  @Post(':userId/follow')
    async followUser(@Headers('Authorization') authHeader: string, @Param('userId') targetUserId: string) {
      const clerkId = this.extractUserIdFromToken(authHeader); // Lấy Clerk ID từ token

      // Tìm MongoDB _id dựa trên Clerk ID
      const follower = await this.usersService.findByClerkId(clerkId);
      if (!follower) {
        throw new NotFoundException('Người dùng không tồn tại!');
      }
      if (follower._id.toString() === targetUserId) {
        throw new BadRequestException("  Không thể tự follow chính mình!");
    }

      console.log("  Yêu cầu theo dõi:", { followerId: follower._id.toString(), targetUserId });

      return this.usersService.followUser(follower._id.toString(), targetUserId);
}


  //   API: Bỏ theo dõi người dùng
  @Delete(':userId/unfollow')
    async unfollowUser(@Headers('Authorization') authHeader: string, @Param('userId') targetUserId: string) {
      const clerkId = this.extractUserIdFromToken(authHeader);

      const follower = await this.usersService.findByClerkId(clerkId);
      if (!follower) {
        throw new NotFoundException('Người dùng không tồn tại!');
      }

      console.log("  Yêu cầu bỏ theo dõi:", { followerId: follower._id.toString(), targetUserId });

      return this.usersService.unfollowUser(follower._id.toString(), targetUserId);
    }

  //   API: Lấy danh sách followers của user
  @Get(':userId/followers')
  async getFollowers(@Param('userId') userId: string) {
    return this.usersService.getFollowers(userId);
  }

  //   API: Lấy danh sách following của user
  @Get(':userId/following')
  async getFollowing(@Param('userId') userId: string) {
    return this.usersService.getFollowing(userId);
  }

  @Get('following-status/:userId')
  async checkFollowStatus(@Headers('Authorization') authHeader: string, @Param('userId') userId: string) {
    const clerkId = this.extractUserIdFromToken(authHeader);
    const follower = await this.usersService.findByClerkId(clerkId);
    if (!follower) {
      throw new NotFoundException('Người dùng không tồn tại!');
    }
    console.log("  Yêu cầu theo dõi 2:", { followerId: follower._id.toString(), userId });
    const isFollowing = await this.usersService.checkFollowStatus(follower._id.toString(), userId);
    return isFollowing ;
  }
}
