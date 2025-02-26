import { BadRequestException, Body, Inject, Injectable, NotFoundException, Type, UploadedFile, UseInterceptors } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { Collection, CollectionDocument } from './collection.schema';
import { Image, ImageDocument } from '../images/schema/images.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UploadApiResponse } from 'cloudinary';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { Cache } from 'cache-manager';
@Injectable()
export class CollectionsService {
    constructor(@InjectModel(Collection.name) private collectionModel: Model<CollectionDocument>,
        @InjectModel(Image.name) private imageModel: Model<ImageDocument>,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,

        private readonly cloudinaryService: CloudinaryService
    ) { }

    @UseInterceptors(FileInterceptor('file'))
    async createCollection(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: { collectionName: string },
        userId: string,
    ): Promise<CollectionDocument> {
        console.log('body', body);
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        // Tạo tag cho Cloudinary
        const tags = ['collection'];

        // Upload ảnh lên Cloudinary
        const result: UploadApiResponse = await this.cloudinaryService.uploadFile(file, tags);

        // Tìm user dựa vào `userId`

        // Tạo collection mới
        const newCollection = new this.collectionModel({
            name: body.collectionName,
            thumbnail: result.secure_url, // Lưu URL ảnh từ Cloudinary
            userId: userId,
        });

        await newCollection.save();

        // Xóa cache bộ sưu tập nếu cần
        await this.cacheManager.del('user_collections');

        return newCollection;
    }

    async getAllCollection(userId: string): Promise<CollectionDocument[]> {
        console.log("test", this.collectionModel.find({ userId }).populate('images').exec());

        return this.collectionModel.find({ userId }).exec();
    }

    async getUserCollections(userId: string) {
        return this.collectionModel.find({ userId }).populate('images').exec();
    }

    async getDetailCollections(collectionId: string) {

        if (!mongoose.Types.ObjectId.isValid(collectionId)) {
            throw new NotFoundException('Invalid collection ID');
        }

        const collection = await this.collectionModel.findById(collectionId).exec();
        if (!collection) throw new NotFoundException('Collection not found');

        // Lấy danh sách ảnh theo thứ tự chính xác
        const images = await this.imageModel
            .find({ _id: { $in: collection.images } }) // Lấy tất cả ảnh trong collection
            .select('url title link')
            .exec();

        // Sắp xếp lại ảnh theo đúng thứ tự trong collection.images
        const orderedImages = collection.images.map(id =>
            images.find(img => img._id.toString() === id.toString())
        );

        return orderedImages;

    }

    async addImageToCollection(collectionId: mongoose.Types.ObjectId, imageId: string) {
        const collection = await this.collectionModel.findById(collectionId);
        if (!collection) throw new NotFoundException('Collection not found');

        if (!collection.images.includes(new mongoose.Types.ObjectId(imageId))) {
            collection.images.push(new mongoose.Types.ObjectId(imageId));
            await collection.save();
        }

        return collection;
    }

    async removeImageFromCollection(collectionId: string, imageId: string) {
        const collectionObjectId = new Types.ObjectId(collectionId);
        const imageObjectId = new Types.ObjectId(imageId);
    
        const collection = await this.collectionModel.findById(collectionObjectId);
        if (!collection) throw new NotFoundException('Collection not found');
    
        // Lọc ra các ảnh có id khác với imageObjectId
        collection.images = collection.images.filter(id => !id.equals(imageObjectId));
    
        await collection.save();
        return collection;
    }
    async updateImageOrder(collectionId: string, imageOrder: string[]) {
        const collection = await this.collectionModel.findById(collectionId);
        if (!collection) throw new NotFoundException('Collection not found');

        // Chuyển đổi danh sách ID ảnh thành ObjectId
        collection.images = imageOrder.map(id => new mongoose.Types.ObjectId(id));
        collection.markModified("images"); // Bắt buộc Mongoose hiểu mảng đã thay đổi
        await collection.save();
        // console.log("Updated Collection Images:", imageOrder);


        await collection.save();
        return collection;
    }
    async updateCollection(collectionId: string, updateData: { name?: string; thumbnail?: Express.Multer.File }) {
        const collection = await this.collectionModel.findById(collectionId);
        if (!collection) throw new NotFoundException('Collection not found');

        if (updateData.name) {
            collection.name = updateData.name;
        }

        if (updateData.thumbnail) {
            const result: UploadApiResponse = await this.cloudinaryService.uploadFile(updateData.thumbnail, ['collection']);
            console.log("Updated Collection's Thumbnail:", result.secure_url)
            collection.thumbnail = result.secure_url;
        }

        await collection.save();
        return collection;
    }

    async deleteCollection(collectionId: string) {
        const collection = await this.collectionModel.findById(collectionId);
        if (!collection) throw new NotFoundException('Collection not found');

        await this.collectionModel.deleteOne({ _id: collectionId });
        return { message: 'Collection deleted successfully' };
    }
    async deleteImageFromCollection(collectionId: string, imageId: string) {
        if (!Types.ObjectId.isValid(collectionId) || !Types.ObjectId.isValid(imageId)) {
            throw new BadRequestException('Invalid collectionId or imageId');
        }
    
        const collection = await this.collectionModel.findById(collectionId);
        if (!collection) {
            throw new NotFoundException('Collection not found');
        }
    
        // Chỉ xóa ảnh khỏi danh sách `images` trong collection, không xóa khỏi database
        collection.images = collection.images.filter(id => id.toString() !== imageId);
    
        await collection.save();
        return { message: "Image removed from collection successfully", collection };
    }
    
}
