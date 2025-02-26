import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type InteractionDocument = Interaction & Document;

@Schema({ timestamps: true })
export class Interaction {
  @Prop({ type: Types.ObjectId, ref: "Image", required: true })
  targetId: Types.ObjectId;

  @Prop({ type: String, enum: ["image", "collection"], required: true })
  targetType: "image" | "collection";

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userId: string;

  @Prop({ type: String, enum: ["like", "comment", "share"], required: true })
  type: "like" | "comment" | "share";

  @Prop({ type: String, default: "" })
  comment?: string; // Chỉ có khi là comment
  // Lịch sử chỉnh sửa bình luận
  @Prop({
    type: [{ text: String, editedAt: Date }],
    default: [],
  })
  editHistory?: { text: string; editedAt: Date }[];

  // Cờ xác định bình luận đã được chỉnh sửa hay chưa
  @Prop({ type: Boolean, default: false })
  isEdited?: boolean;
}

export const InteractionSchema = SchemaFactory.createForClass(Interaction);
