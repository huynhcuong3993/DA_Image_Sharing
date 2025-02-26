import { Controller, Post, Get, Param, Body, UseInterceptors, UploadedFile, Req, Patch, Delete } from '@nestjs/common';
import { CollectionsService } from './collection.service';
import { FileInterceptor } from '@nestjs/platform-express';
import mongoose from 'mongoose';

@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) { }

  @Post()
  @UseInterceptors(FileInterceptor('file'))

  async createCollection(@UploadedFile() file: Express.Multer.File,
    @Body() body: { collectionName: string },
    @Req() req: Request) {
    console.log("req.body", req['user']);
    // this.collectionsService.createCollection(file, body, req['user'])
    return this.collectionsService.createCollection(file, body, req['user']);;
  }

  @Get(':userId')
  async getUserCollections(@Param('userId') userId: string) {
    console.log("userId", userId);
    return this.collectionsService.getUserCollections(userId);
  }

  @Get('/detail/:collectionId')
  async getDetailCollections(@Param('collectionId') collectionId: string) {
    return this.collectionsService.getDetailCollections(collectionId);
  }

  @Post(':collectionId/add-image')
  async addImageToCollection(
    @Param('collectionId') collectionId: string,
    @Body('imageId') imageId: string, // Nhận imageId từ body thay vì params
  ) {
    return this.collectionsService.addImageToCollection(new mongoose.Types.ObjectId(collectionId), imageId);
  }

  @Post(':collectionId/remove-image/:imageId')
  async removeImageFromCollection(@Param('collectionId') collectionId: string, @Param('imageId') imageId: string) {
    return this.collectionsService.removeImageFromCollection(collectionId, imageId);
  }

  @Patch(':collectionId/update-order')
  async updateImageOrder(
    @Param('collectionId') collectionId: string,
    @Body('imageOrder') imageOrder: string[],
  ) {
    console.log('updateImageOrder')
    return this.collectionsService.updateImageOrder(collectionId, imageOrder);
  }
  @Patch(':collectionId')
    @UseInterceptors(FileInterceptor('thumbnail'))
    async updateCollection(
        @Param('collectionId') collectionId: string,
        @UploadedFile() thumbnail: Express.Multer.File,
        @Body() body: { name?: string }
    ) {
      console.log('updateCollection'  )
        return this.collectionsService.updateCollection(collectionId, { name: body.name, thumbnail });
    }

    @Delete(':collectionId')
    async deleteCollection(@Param('collectionId') collectionId: string) {
        return this.collectionsService.deleteCollection(collectionId);
    }
  @Delete(':collectionId/images/:imageId')
  async deleteImageFromCollection(
    @Param('collectionId') collectionId: string,
    @Param('imageId') imageId: string,
    @Req() req
  ) {
    const userId = req.user.id; // Lấy userId từ token
    return this.collectionsService.removeImageFromCollection(collectionId, imageId);
  }
}
