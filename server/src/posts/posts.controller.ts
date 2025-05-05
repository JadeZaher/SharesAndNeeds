import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { Post as PostEntity, PostType } from './post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  async findAll(@Query('type') type?: PostType): Promise<PostEntity[]> {
    if (type) {
      return this.postsService.findByType(type);
    }
    return this.postsService.findAll();
  }

  @Get('search')
  async search(@Query('q') query: string): Promise<PostEntity[]> {
    return this.postsService.search(query);
  }

  @Get('user/:userId')
  async findByUser(@Param('userId') userId: string): Promise<PostEntity[]> {
    return this.postsService.findByUser(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PostEntity> {
    return this.postsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() createPostDto: CreatePostDto,
    @Request() req,
  ): Promise<PostEntity> {
    return this.postsService.create(createPostDto, req.user.id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Request() req,
  ): Promise<PostEntity> {
    return this.postsService.update(id, updatePostDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string, @Request() req): Promise<void> {
    return this.postsService.delete(id, req.user.id);
  }
}
