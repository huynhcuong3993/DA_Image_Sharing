import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Image, ImageSchema  } from '../../modules/images/schema/images.schema';
import { AdminPostsController } from './admin-posts.controller';
import { AdminPostsService } from './admin-posts.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Image.name, schema: ImageSchema }])],
  controllers: [AdminPostsController],
  providers: [AdminPostsService],
})
export class AdminPostsModule {}
