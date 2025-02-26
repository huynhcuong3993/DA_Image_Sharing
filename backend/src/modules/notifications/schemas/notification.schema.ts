import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId; // Người nhận thông báo

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  senderId: Types.ObjectId; // Người tạo thông báo (người đăng bài)

  @Prop({ required: true })
  type: string; // Loại thông báo (new_post, like, comment, ...)

  @Prop({ required: true })
  link: string; // Link bài viết

  @Prop({ required: true, default: "https://res.cloudinary.com/dhdaxdim9/image/upload/v1739173798/samples/cloudinary-icon.png" })
  image: string; // Link bài viết

  @Prop({ required: true })
  message: string; // Nội dung thông báo

  @Prop({ default: false })
  isRead: boolean; // Đánh dấu đã đọc

  @Prop({ default: Date.now })
  createdAt: Date; // Ngày tạo thông báo
}
export type NotificationDocument = Notification & Document;

export const NotificationSchema = SchemaFactory.createForClass(Notification);
