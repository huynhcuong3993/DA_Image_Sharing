import { Injectable, Inject } from '@nestjs/common';
import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';

@Injectable()
export class ImagesService {
  constructor(@Inject('CLOUDINARY') private cloudinaryInstance: typeof cloudinary) {}

  async uploadImage(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      this.cloudinaryInstance.uploader.upload_stream(
        { folder: 'images' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      ).end(file.buffer);
    });
  }
  
}
