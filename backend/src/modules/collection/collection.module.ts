import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CollectionsService } from './collection.service';
import { CollectionsController } from './collection.controller';
import { Collection, CollectionSchema } from './collection.schema';
import { ImagesModule } from '../images/images.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Collection.name, schema: CollectionSchema }]), forwardRef(() => ImagesModule),  CloudinaryModule,],
  controllers: [CollectionsController],
  providers: [CollectionsService],
  exports: [MongooseModule.forFeature([{ name: Collection.name, schema: CollectionSchema }]),CollectionsService],

})
export class CollectionModule {}
