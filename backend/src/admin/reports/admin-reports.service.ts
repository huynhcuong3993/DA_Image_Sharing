import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Report, ReportDocument  } from './schema/reports.schema';

interface CreateReportDto {
    reporterId: string;
    reportedUserId: string;
    imageUrl?: string;
    imageTitle: string,
    reason: string;
  }

@Injectable()
export class AdminReportsService {
  constructor(@InjectModel(Report.name) private reportModel: Model<ReportDocument>) {}

  async getAllReports() {
    return this.reportModel.find().exec(); // Lấy tất cả reports từ MongoDB
  }

  async createReport(reportData: CreateReportDto): Promise<Report> {
    if (!reportData.reporterId || !reportData.reportedUserId || !reportData.reason) {
      throw new BadRequestException('Thiếu thông tin bắt buộc: reporterId, reportedUserId hoặc reason.');
    }

    const newReport = new this.reportModel({
      reporterId: reportData.reporterId,
      reportedUserId: reportData.reportedUserId,
      imageUrl: reportData.imageUrl || null, // Nếu không có URL, đặt giá trị null
      imageTitle: reportData.imageTitle,
      reason: reportData.reason,
      status: 'pending', // Trạng thái mặc định là "pending"
    });

    return await newReport.save();
  }

  async deleteReport(id: string) {
    const deletedReport = await this.reportModel.findByIdAndDelete(id);
    if (!deletedReport) throw new NotFoundException('Report not found');
    return { message: 'Report deleted successfully' };
  }

  async updateReport(id: string, updateData: any) {
    const updatedReport = await this.reportModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedReport) throw new NotFoundException('Report not found');
    return updatedReport;
  }
}
