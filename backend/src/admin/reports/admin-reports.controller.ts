import { Controller, Get, Req, Post, Delete, Param, Patch, Body, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { AdminReportsService } from './admin-reports.service';

@Controller('admin/reports')
export class AdminReportsController {
  constructor(private readonly adminReportsService: AdminReportsService) {}

  @Get()
  async getAllReports() {
    return await this.adminReportsService.getAllReports();
  }

  @Post()
  async createReport(
    @Body() reportData: { imageTitle: string, imageUrl: string; reportedUserId: string; reporterUserId: string; reason: string },
    @Req() req: Request
  ) {  
    console.log('Dữ liệu báo cáo nhận được:', reportData);
  
    if (!reportData.reportedUserId || !reportData.reason || !reportData.reporterUserId) {
      console.error('LỖI: Thiếu thông tin báo cáo.');
      throw new BadRequestException('Thiếu thông tin báo cáo.');
    }
  
    const report = {
      reporterId: reportData.reporterUserId, // Lấy từ token thay vì client gửi
      reportedUserId: reportData.reportedUserId,
      imageUrl: reportData.imageUrl || null, // Đảm bảo imageUrl là null nếu không có
      imageTitle: reportData.imageTitle,
      reason: reportData.reason,
    };
  
    console.log('Dữ liệu báo cáo sẽ được lưu:', report);
  
    return await this.adminReportsService.createReport(report);
  }
  @Delete(':id')
  async deleteReport(@Param('id') id: string) {
    return await this.adminReportsService.deleteReport(id);
  }

  @Patch(':id')
  async updateReport(@Param('id') id: string, @Body() updateData: any) {
    return await this.adminReportsService.updateReport(id, updateData);
  }
}
