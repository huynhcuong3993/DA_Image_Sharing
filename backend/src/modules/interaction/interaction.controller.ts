import { Controller, Post, Body, Get, Param, Delete, Req, UseGuards, UnauthorizedException, NotFoundException, Patch } from "@nestjs/common";
import { InteractionsService } from "./interaction.service";
import { CreateInteractionDto } from "./dtos/create-interaction.dto";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";

@Controller("interactions")
export class InteractionsController {
  constructor(private readonly interactionsService: InteractionsService) { }

  @Post()
  async createInteraction(@Body() dto: CreateInteractionDto, @Req() req: Request) {
    console.log(dto);
    return this.interactionsService.createInteraction(dto, req);
  }

  @Get(":targetId")
  async getInteractions(@Param("targetId") targetId: string) {
    return this.interactionsService.getInteractions(targetId, "image");
  }

  @Get("likes/:targetId")
  async countLikes(@Param("targetId") targetId: string) {
    return this.interactionsService.countLikes(targetId);
  }

  // @Delete(":id")
  @Delete(":commentId")
// @UseGuards(JwtAuthGuard)
async deleteComment(@Req() req, @Param("commentId") commentId: string) {
  const clerkId = req["user"];
  console.log(clerkId);
  // const user = await this.userModel.findOne({ clerkId });
  // if (!user) throw new UnauthorizedException("Người dùng không tồn tại");

  return this.interactionsService.deleteComment(commentId,clerkId);
}
  @Get("count/:targetId")
  async getTotalCounts(@Param("targetId") targetId: string) {
    const likes = await this.interactionsService.countLikes(targetId);
    const comments = await this.interactionsService.countComments(targetId);
    return { likes, comments };
  }
  @Get("comments/:targetId")
  async getComments(@Param("targetId") targetId: string) {
    return this.interactionsService.getComments(targetId);
  }
  @Post("like-status/:imageId")
  // @UseGuards(JwtAuthGuard)
  async checkUserLike(@Body() dto: CreateInteractionDto, @Req() req: Request) {
    console.log("checkUserLike")
    const liked = await this.interactionsService.checkUserLike(dto.userId, dto.targetId);
    return { liked };
  }
  // API toggle like
  @Post("toggle-like/:imageId")
  // @UseGuards(JwtAuthGuard)
  async toggleLike(@Body() dto: CreateInteractionDto, @Req() req: Request) {
    // const clerkId = req.user.id;
    // // if (!clerkId) throw new UnauthorizedException("Người dùng chưa đăng nhập");

    // //   Tìm ObjectId của user từ `UserModel`
    // const userId = req.user.id;
    // // if (!user) throw new NotFoundException("Người dùng không tồn tại");
    // console.log('userId:', userId);

    return this.interactionsService.toggleLike(dto.userId, dto.targetId);
  }


  @Patch("comments/:commentId")
  // @UseGuards(JwtAuthGuard)
  async editComment(
    @Req() req,
    @Param("commentId") commentId: string,
    @Body("newText") newText: string,
    @Body() dto: CreateInteractionDto
  ) {
    console.log('clerkId:', dto.userId);
    console.log('commentId:', commentId);
    console.log('newText:', newText);
  
    return this.interactionsService.editComment(commentId, dto.userId, newText);
  }
  
}
