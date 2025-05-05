import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { User } from '../users/user.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
  ) {}

  async findAll(userId: string): Promise<Message[]> {
    return this.messagesRepository.find({
      where: [
        { senderId: userId },
        { receiverId: userId },
      ],
      relations: ['sender', 'receiver'],
      order: { createdAt: 'DESC' },
    });
  }

  async findConversation(userId: string, otherUserId: string): Promise<Message[]> {
    return this.messagesRepository.find({
      where: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
      relations: ['sender', 'receiver'],
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Message> {
    const message = await this.messagesRepository.findOne({
      where: { id },
      relations: ['sender', 'receiver'],
    });

    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    if (message.senderId !== userId && message.receiverId !== userId) {
      throw new ForbiddenException('You do not have access to this message');
    }

    return message;
  }

  async create(createMessageDto: CreateMessageDto, sender: User): Promise<Message> {
    const message = this.messagesRepository.create({
      ...createMessageDto,
      senderId: sender.id,
    });

    return this.messagesRepository.save(message);
  }

  async markAsRead(messageId: string, userId: string): Promise<Message> {
    const message = await this.findOne(messageId, userId);
    
    if (message.receiverId !== userId) {
      throw new ForbiddenException('You can only mark messages sent to you as read');
    }

    message.isRead = true;
    return this.messagesRepository.save(message);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.messagesRepository.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });
  }

  async getConversations(userId: string): Promise<any[]> {
    const messages = await this.messagesRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .where('message.senderId = :userId OR message.receiverId = :userId', { userId })
      .orderBy('message.createdAt', 'DESC')
      .getMany();

    const conversations = new Map();

    messages.forEach(message => {
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
      const otherUser = message.senderId === userId ? message.receiver : message.sender;

      if (!conversations.has(otherUserId)) {
        conversations.set(otherUserId, {
          user: {
            id: otherUser.id,
            username: otherUser.username,
          },
          lastMessage: message,
          unreadCount: message.receiverId === userId && !message.isRead ? 1 : 0,
        });
      } else if (message.receiverId === userId && !message.isRead) {
        const conv = conversations.get(otherUserId);
        conv.unreadCount += 1;
      }
    });

    return Array.from(conversations.values());
  }
}
