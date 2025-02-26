import { IsNotEmpty, IsEnum, IsOptional, IsString } from "class-validator";

export class CreateInteractionDto {
  @IsNotEmpty()
  targetId: string;

  @IsEnum(["image", "collection"])
  targetType: "image" | "collection";

  @IsNotEmpty()
  userId: string;

  @IsEnum(["like", "comment", "share"])
  type: "like" | "comment" | "share";
  @IsString()
  @IsNotEmpty()
  newText: string;  // Đảm bảo rằng trường này có trong DTO

  @IsOptional()
  @IsString()
  comment?: string; // Chỉ có khi type là "comment"
}
