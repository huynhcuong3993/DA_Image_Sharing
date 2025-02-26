import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Image extends Document{
  @Prop({ required: true })
  url: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true }) 
  userId: Types.ObjectId; 
  @Prop()
  editedUrl?: string;
  @Prop()
  title?: string;
  @Prop()
  publicId?: string;
  @Prop()
  description?: string;
  @Prop()
  position?: Number
  @Prop()
  link?: string;

  @Prop({ type: Types.ObjectId, ref: 'Collection'}) 
  board?: Types.ObjectId;

  @Prop({ type: [String] })
  tags?: string[];

  @Prop({ default: false })
  isPrivate?: boolean;
  @Prop({ default: 0 }) // Tổng số like
  likesCount: number;

  @Prop({ default: 0 }) // Tổng số comment
  commentsCount: number;
}

export type ImageDocument = Image & Document;
export const ImageSchema = SchemaFactory.createForClass(Image);