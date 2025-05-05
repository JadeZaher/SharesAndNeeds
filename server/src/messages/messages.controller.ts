import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { Message } from './message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  async findAll(@Request() req): Promise<Message[]> {
    return this.messagesService.findAll(req.user.id);
  }

  @Get('conversations')
  async getConversations(@Request() req): Promise<any[]> {
    return this.messagesService.getConversations(req.user.id);
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req): Promise<{ count: number }> {
    const count = await this.messagesService.getUnreadCount(req.user.id);
    return { count };
  }

  @Get('conversation/:userId')
  async getConversation(
    @Request() req,
    @Param('userId') otherUserId: string,
  ): Promise<Message[]> {
    return this.messagesService.findConversation(req.user.id, otherUserId);
  }

  @Post()
  async create(
    @Body() createMessageDto: CreateMessageDto,
    @Request() req,
  ): Promise<Message> {
    // Prevent sending messages to yourself
    if (createMessageDto.receiverId === req.user.id) {
      throw new ForbiddenException('Cannot send messages to yourself');
    }

    return this.messagesService.create(createMessageDto, req.user);
  }

  @Post(':id/read')
  async markAsRead(
    @Param('id') id: string,
    @Request() req,
  ): Promise<Message> {
    return this.messagesService.markAsRead(id, req.user.id);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req,
  ): Promise<Message> {
    return this.messagesService.findOne(id, req.user.id);
  }
}
