import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "../users/schemas/user.schema";
import { Image } from "../modules/images/schema/images.schema";
import { Report } from "../admin/reports/schema/reports.schema";

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Image.name) private postModel: Model<Image>,
    @InjectModel(Report.name) private reportModel: Model<Report>,
  ) {}

  async getStats() {
    const usersCount = await this.userModel.countDocuments();
    const postsCount = await this.postModel.countDocuments();
    const reportsCount = await this.reportModel.countDocuments();

    return {
      users: usersCount,
      posts: postsCount,
      reports: reportsCount,
    };
  }
}

