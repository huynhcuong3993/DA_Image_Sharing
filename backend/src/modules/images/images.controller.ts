import { Controller, Post, Get, UploadedFile, UseInterceptors, Body, Req, Param, NotFoundException, Query, ForbiddenException, Res, Patch, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageService } from './images.service';
import { CreateImageDto } from './dtos/create-image.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { Image } from './schema/images.schema';
import { Response } from 'express';
import { UsersService } from '../../users/users.service';
import { Notification } from '../notifications/schemas/notification.schema'; // Import Notification Model
import fetch from 'node-fetch';
@Controller('images')
export class ImageController {
  constructor(
    private readonly imageService: ImageService, @InjectModel(Image.name) 
    private readonly imageModel: Model<Image>,
    private readonly userService: UsersService, // <--- Đảm bảo tên đúng
    @InjectModel(Notification.name) private readonly notificationModel: Model<Notification>, // Inject Notification Model
  ) { }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() createImageDto: CreateImageDto,
    @Req() req: Request
  ) {
    console.log("req.body", req['user']);
    createImageDto.userId = req['user'];
    console.log("createImageDto.userId", createImageDto.board)
    // createImageDto.board = new Types.ObjectId(createImageDto.board);
    if (createImageDto.board && mongoose.Types.ObjectId.isValid(createImageDto.board)) {
      createImageDto.board = new Types.ObjectId(createImageDto.board);
    } else {
      createImageDto.board = null; // Nếu không có board, đặt là null
    }
    await this.imageService.uploadImage(file, createImageDto);
    console.log("Ảnh đã được tải lên thành công!")

    //   **Lấy danh sách followers từ UsersService**
    const user = await this.userService.findByClerkId(createImageDto.userId);

    if (!user || !user.followers.length) {
      console.log('Không có ai theo dõi user này!');
      return { message: 'Ảnh đã được tải lên thành công!' };
    }
    const newImage = await this.imageService.getLatestImageByUser();

    //   **Lưu thông báo vào database**
    const notifications = user.followers.map((followerId) => ({
      userId: followerId, // MongoDB ObjectId của follower
      senderId: user._id, // Chuyển thành MongoDB ObjectId của user
      type: 'new_post',
      link: 'http://localhost:3001/detailImages/image/'+ newImage._id.toString(),
      image: newImage.url ,
      message: 'Người bạn theo dõi' + user.username + 'vừa đăng một bài mới!',
      isRead: false,
      createdAt: new Date(),
    }));
    await this.notificationModel.insertMany(notifications);

    console.log(`Danh sách follow ${user.followers}`);
    //   **Gửi thông báo real-time qua Gmail**
    for (const followerId of user.followers) {
      const userFollow = await this.userService.findByUserID(followerId);
      if (userFollow) {
        console.log(`📧 Gửi email đến: ${userFollow.email}`);
        
        // Gửi email
        await this.imageService.sendEmail(
          userFollow.email,
          "  Thông báo mới từ Image App!",
          `${user.username} vừa đăng một bài viết mới! 
          Link : http://localhost:3001/detailImages/image/${newImage._id.toString()}`
        );
      }
    }
    
        //senderId: user._id.toString(),
       // message: `  ${user.username} vừa đăng một bài mới!`,



    return { message: 'Ảnh đã được tải lên thành công!' };
  }

  @Post()
  async getAllCollections(@Req() req: Request) {
    console.log("req.body", req['user']);
    return this.imageService.getAllCollections(req['user']);
  }

  @Get('latest')
  async getLatestImages() {
    return await this.imageService.getLatestImages();
  }
  @Get()
  async getImages() {
    return this.imageService.getAllImages();
  }
  @Get("search")
  async searchImages(@Query("q") query: string) {
    console.log("  Query nhận được:", query);

    if (!query) {
      return { message: "Không có query để tìm kiếm!" };
    }

    const result = await this.imageService.searchImages(query);
    console.log("  Kết quả tìm kiếm:", result); // Log để debug
    return result;
  }
  @Get(':id')
  async getImageById(@Param('id') id: string) {
      console.log("Fetching image:", id);
  
      const image = await this.imageModel
        .findById(id)
        .populate({
          path: 'userId',
          select: 'username avatar',
        })
        .exec();
  
      if (!image) {
        throw new NotFoundException('Image not found');
      }
  
      console.log("Returning image:", image);
    return {
      _id: image._id,
      url: image.url,
      title: image.title,
      description: image.description,
      tags: image.tags,
      userId: image.userId,
      isPrivate: image.isPrivate, //   Trả về trạng thái `isPrivate`
    };
  }
  
  @Post('effect/:id')
  async applyEffect(@Param('id') imageId: string, @Body() body) {
    return this.imageService.applyEffect(imageId, body.effect);
  }

  @Post('remove-background/:id')
  async removeBackground(@Param('id') imageId: string) {
    return this.imageService.removeBackground(imageId);
  }

  @Post('blur-background/:id')
  async blurBackground(@Param('id') imageId: string) {
    console.log('blur-background');
    return this.imageService.blurBackground(imageId);
  }

  @Post('artistic-style/:id')
  async artisticStyle(@Param('id') imageId: string, @Body() body) {
    return this.imageService.artisticStyle(imageId, body.style);
  }

  @Get('user/:userId')
  async getUserImages(@Param('userId') userId: string) {
    console.log(userId)
    return this.imageService.getImagesByUser(userId);
  }
  @Post(":id/brightness")
  async adjustBrightness(
    @Param("id") id: string,
    @Body() body: { level: number },
  ) {

    const editedUrl = await this.imageService.brightnessAdjust(id, body.level);
    return { editedUrl };
  }
  @Post(":id/color")
  async adjustColor(
    @Param("id") id: string,
    @Body() body: { level: number },
  ) {

    const editedUrl = await this.imageService.colorAdjust(id, body.level);
    return { editedUrl };
  }
  @Post(":id/contrast")
  async adjustContrast(
    @Param("id") id: string,
    @Body() body: { level: number },
  ) {

    const editedUrl = await this.imageService.contrastAdjust(id, body.level);
    return { editedUrl };
  }

  @Get('proxy/url')
  async getImage(@Query('url') url: string, @Res() res: Response) {
    try {
      const response = await fetch(url);
      const buffer = await response.buffer();
      res.setHeader('Content-Type', response.headers.get('content-type'));
      res.send(buffer);
    } catch (error) {
      res.status(500).json({ error: 'Không thể tải ảnh' });
    }
  }
  @Patch(':id')
  async updateImage(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() updateData: { title?: string; description?: string; tags?: string[] }
  ) {
    const userId = req['user'];
    return this.imageService.updateImage(id, userId, updateData);
  }
  @Delete(':id')
  async deleteImage(@Param('id') id: string, @Req() req: Request) {
    const userId = req['user'];
    return this.imageService.deleteImage(id, userId);
  }

  @Patch(':id/privacy')
  async toggleImagePrivacy(
    @Param('id') id: string,
    @Body('isPrivate') isPrivate: boolean
  ) {
    const updatedImage = await this.imageService.updatePrivacy(id, isPrivate);
    if (!updatedImage) {
      throw new NotFoundException('Ảnh không tồn tại');
    }
    return { message: 'Cập nhật trạng thái thành công', image: updatedImage };
  }

}
