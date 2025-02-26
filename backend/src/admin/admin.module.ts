import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { UsersModule } from "../users/users.module";
import { ImagesModule } from "../modules/images/images.module";
import { AdminReportsModule } from "../admin/reports/admin-reports.module";

@Module({
  imports: [
    // Import the module that provides UserModel
    UsersModule, 
    ImagesModule,
    AdminReportsModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
