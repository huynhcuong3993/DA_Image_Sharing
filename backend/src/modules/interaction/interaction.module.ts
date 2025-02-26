import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Interaction, InteractionSchema } from './schemas/interaction.schema';
import { ImagesModule } from '../images/images.module';
import { InteractionsController } from './interaction.controller';
import { InteractionsService } from './interaction.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Interaction.name, schema: InteractionSchema }]), 
    forwardRef(() => ImagesModule),
    forwardRef(() => UsersModule), //   Thêm vào đây
  ],
  controllers: [InteractionsController],
  providers: [InteractionsService],
  exports: [InteractionsService], // Nếu module khác cần sử dụng
})
export class InteractionModule {}
