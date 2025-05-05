import { IsString, IsNotEmpty, IsEnum, IsOptional, IsUrl } from 'class-validator';
import { PostType } from '../post.entity';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @IsEnum(PostType, { message: 'Type must be either "share" or "need"' })
  @IsNotEmpty({ message: 'Type is required' })
  type: PostType;

  @IsUrl({}, { message: 'Please provide a valid URL' })
  @IsOptional()
  imageUrl?: string;
}
