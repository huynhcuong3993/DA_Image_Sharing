import { Controller, Get, Delete, Param, Patch, Body, NotFoundException, UseGuards } from '@nestjs/common';
import { AdminUsersService } from './admin-users.service';

@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  async getAllUsers() {
    return await this.adminUsersService.getAllUsers();
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return await this.adminUsersService.deleteUser(id);
  }

  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() updateData: any) {
    return await this.adminUsersService.updateUser(id, updateData);
  }
}
