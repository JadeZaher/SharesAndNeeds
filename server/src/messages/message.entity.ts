import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @ManyToOne(() => User, user => user.sentMessages)
  sender: User;

  @Column()
  senderId: string;

  @ManyToOne(() => User, user => user.receivedMessages)
  receiver: User;

  @Column()
  receiverId: string;

  @Column()
  conversationId: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  isRead: boolean;

  constructor(partial: Partial<Message>) {
    Object.assign(this, partial);
  }
}
