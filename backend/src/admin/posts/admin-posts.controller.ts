import { Controller, Get, Delete, Param, Patch, Body, NotFoundException, UseGuards } from '@nestjs/common';
import { AdminPostsService } from './admin-posts.service';

@Controller('admin/posts')
export class AdminPostsController {
  constructor(private readonly adminPostsService: AdminPostsService) {}

  @Get()
  async getAllPosts() {
    return await this.adminPostsService.getAllPosts();
  }

  @Delete(':id')
  async deletePost(@Param('id') id: string) {
    return await this.adminPostsService.deletePost(id);
  }

  @Patch(':id')
  async updatePost(@Param('id') id: string, @Body() updateData: any) {
    return await this.adminPostsService.updatePost(id, updateData);
  }
}
