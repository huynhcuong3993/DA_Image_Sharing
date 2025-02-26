import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument  } from '../../users/schemas/user.schema';

@Injectable()
export class AdminUsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async getAllUsers() {
    return this.userModel.find().exec(); // Lấy tất cả users từ MongoDB
  }

  async deleteUser(id: string) {
    const deletedUser = await this.userModel.findByIdAndDelete(id);
    if (!deletedUser) throw new NotFoundException('User not found');
    return { message: 'User deleted successfully' };
  }

  async updateUser(id: string, updateData: any) {
    const updatedUser = await this.userModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedUser) throw new NotFoundException('User not found');
    return updatedUser;
  }
}
