import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Interaction, InteractionDocument } from "./schemas/interaction.schema";
import { CreateInteractionDto } from "./dtos/create-interaction.dto";
import { User, UserDocument } from "src/users/schemas/user.schema";

@Injectable()
export class InteractionsService {
  constructor(
    @InjectModel(Interaction.name) private interactionModel: Model<InteractionDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>

  ) {}

  //   Thêm like, comment hoặc share
  async createInteraction(dto: CreateInteractionDto, req: any) {
    if (!dto.targetId || !dto.targetType) throw new NotFoundException("targetId và targetType là bắt buộc");
  
    // Lấy userId từ request (Clerk ID)
    const clerkId = req["user"];
    if (!clerkId) throw new UnauthorizedException("Người dùng chưa đăng nhập");
    //   Tìm ObjectId từ `UserModel`
    const user = await this.userModel.findOne({ clerkId });
    if (!user) throw new NotFoundException("Người dùng không tồn tại");
  
    //   Thay thế Clerk ID bằng ObjectId của user
    const interaction = await this.interactionModel.create({
      ...dto,
      targetId: new this.interactionModel.base.Types.ObjectId(dto.targetId),
      userId: user._id, // Lưu ObjectId thay vì Clerk ID
    });
  
    return interaction;
  }
  

  //   Lấy danh sách tất cả tương tác (like & comment) của một ảnh
  async getInteractions(targetId: string, targetType: string) {
    return this.interactionModel
      .find({ targetId, targetType })
      .populate({
        path: "userId",
        select: "avatar username clerkId", // Lấy avatar và username của user
      })
      .exec();
  }
  

  //   Đếm số lượng like của ảnh
  async countLikes(targetIdstr: string) {
    const targetId = new this.interactionModel.base.Types.ObjectId(targetIdstr);
    return this.interactionModel.countDocuments({ targetId, type: "like" }).exec();
  }

  //   Đếm số lượng comment của ảnh
  async countComments(targetId: string) {
    return this.interactionModel.countDocuments({ targetId, type: "comment" }).exec();
  }

  //   Xóa bình luận (chỉ user sở hữu mới có quyền)
  async deleteComment(commentId: string, userId: string) {
  const comment = await this.interactionModel.findById(commentId);
  if (!comment) throw new NotFoundException("Bình luận không tồn tại");

  

  await this.interactionModel.findByIdAndDelete(commentId);
  return { message: "Bình luận đã bị xoá" };
}

async editComment(commentId: string, userId: string, newText: string) {
  if (!commentId) {
    console.log("commentId không hợp lệ");
    // return;
  }
  
  const comment = await this.interactionModel.findById(commentId);
  if (!comment) {
    console.log("Không tìm thấy bình luận với commentId", commentId);
    return;
  }
  console.log("Bình luận tìm thấy:", comment);
  
  if (!comment) throw new NotFoundException("Bình luận không tồn tại");



  // Lưu lịch sử chỉnh sửa
  const history = comment.editHistory || [];
  history.push({ text: comment.comment, editedAt: new Date() });

  // Cập nhật bình luận
  comment.comment = newText;
  comment.editHistory = history;
  await comment.save();

  return { message: "Bình luận đã được chỉnh sửa", comment };
}


  async getComments(targetIdstr: string) {
    const targetId = new this.interactionModel.base.Types.ObjectId(targetIdstr);
    return this.interactionModel.find({ targetId, type: "comment" }).populate("userId", "username avatar clerkId");
  }
  // Kiểm tra xem người dùng đã like ảnh chưa
  async checkUserLike(userId: string, targetId: string): Promise<boolean> {
    console.log('userId:', userId);
    if (!userId || !targetId) {
      throw new BadRequestException("Thiếu userId hoặc targetId");
    }

    const user = await this.userModel.findOne({clerkId: userId });
    if (!user) throw new NotFoundException("Người dùng không tồn tại");
    const userIdObj = user._id;
  
    //   Tìm xem user đã like chưa
    const existingLike = await this.interactionModel.findOne({
      userId: userIdObj,
        targetId: new this.interactionModel.base.Types.ObjectId(targetId),
        targetType: "image",
        type: "like",
    });
  
    return !!existingLike; // Trả về `true` nếu đã like, `false` nếu chưa
  }
  

  // Xử lý like/unlike
  async toggleLike(userId: string, targetId: string) {
    if (!userId || !targetId) {
      throw new BadRequestException("userId và targetId là bắt buộc");
    }
    console.log(userId);
    const user = await this.userModel.findOne({clerkId: userId });
    if (!user) throw new NotFoundException("Người dùng không tồn tại");
    const userIdObj = user._id;
    //   Tìm xem user đã like ảnh chưa
    const existingLike = await this.interactionModel.findOne({
      userId: userIdObj,
        targetId: new this.interactionModel.base.Types.ObjectId(targetId),
        targetType: "image",
        type: "like",
    });
  
    if (existingLike) {
      //   Nếu đã like, xóa like (unlike)
      await this.interactionModel.deleteOne({ _id: existingLike._id });
      return { message: "Đã bỏ like", liked: false };
    } else {
      console.log('userIdsdadasdasdsdadasdasd:', userId);
      //   Nếu chưa like, thêm like mới
      const newLike = await this.interactionModel.create({
        userId: userIdObj,
        targetId: new this.interactionModel.base.Types.ObjectId(targetId),
        targetType: "image",
        type: "like",
      });
  
      return { message: "Đã like", liked: true };
    }
  }
  
}
