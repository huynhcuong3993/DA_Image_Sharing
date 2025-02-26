import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReportDocument = Report & Document;

@Schema({ timestamps: true }) // Tự động thêm `createdAt` & `updatedAt`
export class Report {
  @Prop({ required: true }) // Người báo cáo (kiểu string)
  reporterId: string;

  @Prop({ required: true }) // Người bị báo cáo (kiểu string)
  reportedUserId: string;

  @Prop({ required: false }) // URL của ảnh bị báo cáo (nếu có)
  imageUrl?: string;

  @Prop({ required: false }) // URL của ảnh bị báo cáo (nếu có)
  imageTitle?: string;

  @Prop({ required: true }) // Lý do báo cáo
  reason: string;

  @Prop({ default: 'pending', enum: ['pending', 'resolved', 'rejected'] }) // Trạng thái xử lý
  status: string;
}

export const ReportSchema = SchemaFactory.createForClass(Report);
