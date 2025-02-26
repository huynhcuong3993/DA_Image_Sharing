import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { Types } from 'mongoose';

export class CreateImageDto {
  
  @IsString()
  @IsOptional()
  url: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  link?: string;
  @IsString()
  @IsOptional()
  publicId?: string;


  @IsString()
  @IsOptional()
  board?: Types.ObjectId;

  @IsString({ each: true }) // Array of strings
  @IsOptional()
  tags?: string[];

  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean;
}
