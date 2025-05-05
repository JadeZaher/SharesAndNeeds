import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty({ message: 'Message content is required' })
  content: string;

  @IsUUID()
  @IsNotEmpty({ message: 'Receiver ID is required' })
  receiverId: string;

  @IsString()
  @IsNotEmpty({ message: 'Conversation ID is required' })
  conversationId: string;
}
