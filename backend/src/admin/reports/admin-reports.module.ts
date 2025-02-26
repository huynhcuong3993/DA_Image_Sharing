import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Report, ReportSchema } from './schema/reports.schema';
import { AdminReportsController } from './admin-reports.controller';
import { AdminReportsService } from './admin-reports.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Report.name, schema: ReportSchema }])],
  controllers: [AdminReportsController],
  providers: [AdminReportsService],
  exports: [MongooseModule],
})
export class AdminReportsModule {}
