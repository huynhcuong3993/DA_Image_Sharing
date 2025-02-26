import { Injectable, NotFoundException, BadRequestException, } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RedisService } from '../redis/redis.service';
import { User } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private redisService: RedisService,
  ) { }
  async findByClerkId(clerkId: string): Promise<User | null> {
    let user = await this.redisService.getUser(clerkId);

    if (!user) {
      user = await this.userModel.findOne({ clerkId });

      if (user) {
        await this.redisService.setUser(clerkId, user);
      }
    }

    return user;
  }
  async findOrCreateUser(userData: any): Promise<User> {
    console.log('findOrCreateUser', userData);
    let user = await this.redisService.getUser(userData.clerkId);

    if (!user) {
      user = await this.userModel.findOne({ clerkId: userData.clerkId });

      if (!user) {
        user = await this.userModel.create(userData);
      }

      await this.redisService.setUser(user.clerkId, user);
    }

    return user;
  }

  async getUser(userId: string) {
    return this.redisService.getUser(userId) || this.userModel.findOne({ clerkId: userId });
  }
  // users.service.ts
  async updateUser(userId: string, updateData: UpdateUserDto) {
    console.log("updateData:", userId);

    const { email, ...allowedUpdates } = updateData;
    console.log("allowedUpdates:", allowedUpdates);

    const user = await this.userModel.findOneAndUpdate(
      { clerkId: userId }, //   Sửa `userId` thành `clerkId`
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new NotFoundException("User not found");
    }

    //console.log("Updated user:", user);
    return user;
  }

  // API: Theo dõi user
  async followUser(userId: string, targetUserId: string): Promise<User> {
    if (userId === targetUserId) {
      throw new BadRequestException('Bạn không thể theo dõi chính mình!');
    }

    const userObjectId = new Types.ObjectId(userId); // Chuyển đổi string thành ObjectId
    const targetObjectId = new Types.ObjectId(targetUserId);

    const user = await this.userModel.findById(userObjectId);
    const targetUser = await this.userModel.findById(targetObjectId);

    if (!user || !targetUser) {
      throw new NotFoundException('Người dùng không tồn tại!');
    }

    if (user.following.includes(targetObjectId)) {
      throw new BadRequestException('Bạn đã theo dõi người này rồi!');
    }

    user.following.push(targetObjectId);
    targetUser.followers.push(userObjectId);

    await user.save();
    await targetUser.save();

    return user;
  }

  // API: Bỏ theo dõi user
  async unfollowUser(userId: string, targetUserId: string): Promise<User> {
    if (userId === targetUserId) {
      throw new BadRequestException('Bạn không thể bỏ theo dõi chính mình!');
    }

    const userObjectId = new Types.ObjectId(userId);
    const targetObjectId = new Types.ObjectId(targetUserId);

    const user = await this.userModel.findById(userObjectId);
    const targetUser = await this.userModel.findById(targetObjectId);

    if (!user || !targetUser) {
      throw new NotFoundException('Người dùng không tồn tại!');
    }

    if (!user.following.includes(targetObjectId)) {
      throw new BadRequestException('Bạn chưa theo dõi người này!');
    }

    user.following = user.following.filter(id => !id.equals(targetObjectId));
    targetUser.followers = targetUser.followers.filter(id => !id.equals(userObjectId));

    await user.save();
    await targetUser.save();

    return user;
  }

// API: Lấy danh sách followers của user
async getFollowers(userId: string): Promise<Partial<User>[]> {
  const user = await this.userModel
    .findById(userId)
    .populate<{ followers: User[] }>('followers', 'username email avatar')
    .exec();

  if (!user) {
    throw new NotFoundException('Người dùng không tồn tại!');
  }

  return user.followers.map(({ _id, username, email, avatar }) => ({
    _id,
    username,
    email,
    avatar,
  }));
}

// API: Lấy danh sách following của user
async getFollowing(userId: string): Promise<Partial<User>[]> {
  const user = await this.userModel
    .findById(userId)
    .populate<{ following: User[] }>('following', 'username email avatar')
    .exec();

  if (!user) {
    throw new NotFoundException('Người dùng không tồn tại!');
  }

  return user.following.map(({ _id, username, email, avatar }) => ({
    _id,
    username,
    email,
    avatar,
  }));
}

async findByUsername(username: string): Promise<User | null> {
  return this.userModel.findOne({ username }).exec();
}

async findByUserID(UID: Types.ObjectId): Promise<User | null> {
  const user = await this.userModel.findOne({ _id: UID }).exec();
  return user;
}


async checkFollowStatus(currentUserId: string, targetUserId: string): Promise<boolean> {
  const currentUser = await this.userModel.findById(new Types.ObjectId(currentUserId));
  if (!currentUser) {
  return false;  // Trả về false nếu không tìm thấy người dùng
  }
  const targetObjectId = new Types.ObjectId(targetUserId);
  return currentUser.following.includes(targetObjectId);
}
}
