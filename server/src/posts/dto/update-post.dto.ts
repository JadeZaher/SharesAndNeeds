import { IsString, IsOptional, IsEnum, IsUrl } from 'class-validator';
import { PostType } from '../post.entity';

export class UpdatePostDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(PostType, { message: 'Type must be either "share" or "need"' })
  @IsOptional()
  type?: PostType;

  @IsUrl({}, { message: 'Please provide a valid URL' })
  @IsOptional()
  imageUrl?: string;
}
