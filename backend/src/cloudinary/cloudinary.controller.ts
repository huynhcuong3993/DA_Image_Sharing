import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryResponse } from './cloudinary-response';

@Controller('upload')
export class CloudinaryController {
    constructor(private readonly cloudinaryService: CloudinaryService ) {}
    @Post('file')
    @UseInterceptors(FileInterceptor('file'))
    UploadImage(@UploadedFile() file: Express.Multer.File): Promise<CloudinaryResponse> {
        return this.cloudinaryService.uploadFile(file, ['image']);
    }

}
