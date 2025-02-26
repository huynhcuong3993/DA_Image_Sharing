import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Image } from '../images/schema/images.schema';

export type CollectionDocument = HydratedDocument<Collection>;

@Schema({ timestamps: true })
export class Collection {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  userId: string;

  @Prop()
  thumbnail?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Image' }] })
  images: Types.ObjectId[];
}

export const CollectionSchema = SchemaFactory.createForClass(Collection);
