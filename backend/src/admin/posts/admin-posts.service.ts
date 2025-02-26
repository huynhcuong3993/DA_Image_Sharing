import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Image, ImageDocument  } from '../../modules/images/schema/images.schema';

@Injectable()
export class AdminPostsService {
  constructor(@InjectModel(Image.name) private postModel: Model<ImageDocument>) {}

  async getAllPosts() {
    return this.postModel.find().exec(); 
  }

  async deletePost(id: string) {
    const deletedPost = await this.postModel.findByIdAndDelete(id);
    if (!deletedPost) throw new NotFoundException('Post not found');
    return { message: 'Post deleted successfully' };
  }

  async updatePost(id: string, updateData: any) {
    const updatedPost = await this.postModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedPost) throw new NotFoundException('Post not found');
    return updatedPost;
  }
}
