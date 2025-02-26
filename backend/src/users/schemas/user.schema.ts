import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true }) // Thêm timestamps để tự động lưu `createdAt` và `updatedAt`
export class User {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true }) // Đảm bảo `clerkId` là duy nhất và yêu cầu
  clerkId: string;

  @Prop({ required: true, unique: true }) // Đảm bảo `email` là duy nhất và yêu cầu
  email: string;

  @Prop({ required: true }) // `username` yêu cầu và không thể trống
  username: string;

  @Prop({ required: false }) // `firstName` có thể là rỗng
  firstName: string;

  @Prop({ required: false }) // `lastName` có thể là rỗng
  lastName: string;

  @Prop({ required: false }) // `avatar` có thể là rỗng
  avatar: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] }) // Danh sách người theo dõi
  followers: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] }) // Danh sách người mà user này đang theo dõi
  following: Types.ObjectId[];
}

// Tạo schema từ class User
export const UserSchema = SchemaFactory.createForClass(User);
