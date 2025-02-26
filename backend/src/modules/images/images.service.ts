import { Injectable, Inject, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { UploadApiResponse } from 'cloudinary';
import { Image, ImageDocument } from './schema/images.schema'; // Adjust import path
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CreateImageDto } from './dtos/create-image.dto';
import { User } from '../../users/schemas/user.schema';
import { CollectionsService } from '../collection/collection.service';
import { Collection, CollectionDocument } from '../collection/collection.schema';
import { UsersService } from 'src/users/users.service';
import * as nodemailer from "nodemailer";

@Injectable()
export class ImageService {
  constructor(
    @InjectModel(Image.name) private readonly imageModel: Model<ImageDocument>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly cloudinaryService: CloudinaryService,
    @InjectModel(Collection.name) private collectionModel: Model<CollectionDocument>,
    private readonly collectionsService: CollectionsService,
    private readonly userService: UsersService


  ) { }

  async uploadImage(
    file: Express.Multer.File,
    createImageDto: CreateImageDto
  ): Promise<ImageDocument> {
    if (!file) {
      throw new Error("No file provided");
    }
    console.log(createImageDto);

    // Upload ảnh lên Cloudinary
    const result: UploadApiResponse = await this.cloudinaryService.uploadFile(file, createImageDto.tags);

    const user = await this.userModel.findOne({ clerkId: createImageDto.userId });
    if (!user) {
      console.log(createImageDto.userId);
      throw new NotFoundException("User not found");
    }

    // Tạo ảnh mới trong database
    const newImage = new this.imageModel({
      ...createImageDto,
      userId: new Types.ObjectId(user._id),
      url: result.secure_url,
      publicId: result.public_id
    });

    await newImage.save();
    const boardId = createImageDto.board?.toString();
    //   Chỉ thêm vào collection nếu `board` hợp lệ
    if (
      boardId &&
      boardId !== "default" &&
      boardId !== "" &&
      mongoose.Types.ObjectId.isValid(boardId)
    ) {
      const collection = await this.collectionsService.addImageToCollection(
        new Types.ObjectId(boardId),
        newImage._id as string
      );
      if (!collection) {
        console.warn(`Collection not found: ${createImageDto.board}`);
      }
    } else {
      console.log("No valid board selected, skipping collection update.");
    }

    console.log("Uploading image...");

    // Xóa cache ảnh mới nhất
    await this.cacheManager.del("latest_images");

    return newImage;
  }


  async getAllCollections(user) {
    try {
      return this.collectionModel.find({ userId: user }).lean(); // Tìm theo userId dạng string
    } catch (error) {
      console.error("Lỗi khi lấy collections:", error);
      throw new Error("Không thể lấy collections");
    }
  }

  async getLatestImageByUser(): Promise<Image | null> {
    const latestImage = await this.imageModel
      .findOne({}) // Chỉ lấy ảnh của user có `userId` cụ thể
      .sort({ createdAt: -1 }) // Sắp xếp theo `createdAt` mới nhất
      .select('_id ') // Chỉ lấy `_id`
      .exec();
  
    return latestImage ? latestImage : null;
  }

  async getLatestImages(): Promise<ImageDocument[]> {
    const cachedImages = await this.cacheManager.get<string>('latest_images');
    if (cachedImages) return JSON.parse(cachedImages);
    const images = await this.imageModel.find().sort({ createdAt: -1 }).limit(10).exec();
    await this.cacheManager.set('latest_images', JSON.stringify(images), 600);

    return images;
  }
  async getAllImages() {
    return this.imageModel.find().lean();
  }
  async findById(id: string): Promise<Image | null> {
    return this.imageModel.findById(id).exec();
  }
  async searchImages(query: string): Promise<any[]> {
    if (!query) return [];
  
    const images = await this.imageModel
      .find({
        $or: [
          { title: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
          { tags: { $elemMatch: { $regex: query, $options: "i" } } },
        ],
      })
      .populate("userId", "username avatar")
      .exec();
  
    // Thay đổi đường dẫn trả về
    return images.map((image) => ({
      ...image.toObject(),
    }));
  }
  async applyEffect(imageId: string, effect: string) {
    const image = await this.imageModel.findById(imageId);
    if (!image) throw new Error('Ảnh không tồn tại');

    image.editedUrl = await this.cloudinaryService.applyEffect(image.publicId, effect);
    return image.save();
  }

  async removeBackground(imageId: string) {
    const image = await this.imageModel.findById(imageId);
    if (!image) throw new Error('Ảnh không tồn tại');
    console.log(image.publicId);

    image.editedUrl = await this.cloudinaryService.removeBackground(image.publicId);
    return image.save();
  }

  async blurBackground(imageId: string) {
    const image = await this.imageModel.findById(imageId);
    if (!image) throw new Error('Ảnh không tồn tại');
    console.log(image.publicId);

    image.editedUrl = await this.cloudinaryService.blurBackground(image.publicId);
    return image.save();
  }

  async artisticStyle(imageId: string, style: string) {
    const image = await this.imageModel.findById(imageId);
    if (!image) throw new Error('Ảnh không tồn tại');

    image.editedUrl = await this.cloudinaryService.artisticStyle(image.publicId, style);
    return image.save();
  }

  async brightnessAdjust(imageId: string, level: number) {
    const image = await this.imageModel.findById(imageId);
    if (!image) throw new Error('Ảnh không tồn tại');

    image.editedUrl = await this.cloudinaryService.adjustBrightness(image.publicId, level);
    return image.save();
  }

  async colorAdjust(imageId: string, level: number) {
    const image = await this.imageModel.findById(imageId);
    if (!image) throw new Error('Ảnh không tồn tại');

    image.editedUrl = await this.cloudinaryService.adjustColor(image.publicId, level);
    return image.save();
  }
  async contrastAdjust(imageId: string, level: number) {
    const image = await this.imageModel.findById(imageId);
    if (!image) throw new Error('Ảnh không tồn tại');

    image.editedUrl = await this.cloudinaryService.adjustContrast(image.publicId, level);
    return image.save();
  }

  async getImagesByUser(userId: string) {
    console.log('userId:', userId);
    const user = await this.userService.findByClerkId(userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    console.log('MongoDB user _id:', user._id);  // Convert ObjectId -> string

    // Tìm ảnh bằng userId là string
    return this.imageModel.find({ userId: user._id }).exec();
  }
  async deleteImage(imageId: string, userId: string) {
    console.log('userId:', userId);
    const user = await this.userService.findByClerkId(userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    const image = await this.imageModel.findById(imageId);
    if (!image) throw new NotFoundException('Ảnh không tồn tại');

    if (image.userId.toString() !== user._id.toString()) {
      throw new UnauthorizedException('Bạn không có quyền xóa ảnh này');
    }

    // Xóa ảnh khỏi Cloudinary
    await this.cloudinaryService.deleteFile(image.publicId);

    // Xóa ảnh khỏi MongoDB
    await this.imageModel.deleteOne({ _id: imageId });

    // Xóa ảnh khỏi bộ sưu tập nếu có
    if (image.board) {
      await this.collectionsService.removeImageFromCollection(image.board.toString(), imageId);
    }

    return { message: 'Ảnh đã được xóa thành công!' };
  }

  async updateImage(
    imageId: string,
    userId: string,
    updateData: { title?: string; description?: string; tags?: string[] }
  ) {
    const user = await this.userService.findByClerkId(userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    const image = await this.imageModel.findById(imageId);
    if (!image) throw new NotFoundException('Ảnh không tồn tại');
    
    if (image.userId.toString() !== user._id.toString()) {

      throw new UnauthorizedException('Bạn không có quyền chỉnh sửa ảnh này');
    }

    // Cập nhật thông tin ảnh
    if (updateData.title) image.title = updateData.title;
    if (updateData.description) image.description = updateData.description;
    if (updateData.tags) image.tags = updateData.tags;

    await image.save();
    return image;
  }

  async sendEmail(to: string, subject: string, message: string) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Gmail của bạn
        pass: process.env.EMAIL_PASS, // Mật khẩu ứng dụng Gmail
      },
    });
  
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text: message, // Nội dung email dạng text
    });
  
    console.log(`📧 Đã gửi email đến: ${to}`);
  }

  async updatePrivacy(id: string, isPrivate: boolean) {
    const updatedImage = await this.imageModel.findByIdAndUpdate(
      id,
      { isPrivate },
      { new: true }
    );
    return updatedImage;
  }

}
