import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Socket } from 'socket.io';
import { Chat } from '../entities/chats/chat.entity';
import { User } from '../entities/users/user.entity';

@Injectable()
export class SocketService {
  private connectedUsers = new Map<number, Socket>();
  private merchantRoom = 'merchants';
  private customerRoom = 'customers';

  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  addUser(userId: number, socket: Socket) {
    this.connectedUsers.set(userId, socket);
    console.log(`User ${userId} connected. Total: ${this.connectedUsers.size}`);
  }

  removeUser(userId: number) {
    this.connectedUsers.delete(userId);
    console.log(
      `User ${userId} disconnected. Total: ${this.connectedUsers.size}`,
    );
  }

  async sendMessage(senderId: number, receiverId: number, content: string) {
    // Validate content is not empty
    if (!content || content.trim() === '') {
      throw new Error('Message content cannot be empty');
    }
    // Validate users exist
    const sender = await this.userRepository.findOneBy({ id: senderId });
    if (!sender) {
      throw new NotFoundException(`Sender with ID ${senderId} not found`);
    }

    const receiver = await this.userRepository.findOneBy({ id: receiverId });
    if (!receiver) {
      throw new NotFoundException(`Receiver with ID ${receiverId} not found`);
    }

    // Create and save the message with explicit column values
    const message = new Chat();
    message.content = content;
    message.isRead = false;
    message.sender = sender;
    message.receiver = receiver;

    const savedMessage = await this.chatRepository.save(message);
    const returnedMessage = {
      id: savedMessage.id,
      content: savedMessage.content,
      isRead: savedMessage.isRead,
      sender: {
        id: savedMessage.sender.id,
        name: savedMessage.sender.name,
        email: savedMessage.sender.email,
      },
      receiver: {
        id: savedMessage.receiver.id,
        name: savedMessage.receiver.name,
        email: savedMessage.receiver.email,
      },
      createdAt: savedMessage.createdAt,
      updatedAt: savedMessage.updatedAt,
    };
    return returnedMessage;
  }

  async getConversation(user1Id: number, user2Id: number): Promise<Chat[]> {
    return this.chatRepository.find({
      relations: {
        sender: true,
        receiver: true,
      },
      where: [
        { sender: { id: user1Id }, receiver: { id: user2Id } },
        { sender: { id: user2Id }, receiver: { id: user1Id } },
      ],
      order: {
        createdAt: 'ASC',
      },
      select: {
        sender: {
          id: true,
          name: true,
          email: true,
        },
        receiver: {
          id: true,
          name: true,
          email: true,
        },
      },
    });
  }

  async markMessagesAsRead(senderId: number, receiverId: number) {
    await this.chatRepository.update(
      {
        sender: { id: senderId },
        receiver: { id: receiverId },
        isRead: false,
      },
      { isRead: true },
    );
  }

  getConnectedUsers(): number[] {
    return Array.from(this.connectedUsers.keys());
  }

  getUserSocket(userId: number) {
    return this.connectedUsers.get(userId);
  }

  async joinMerchantsRoom(socket: Socket) {
    await socket.join(this.merchantRoom);
  }

  async joinCustomersRoom(socket: Socket) {
    await socket.join(this.customerRoom);
  }
  getMerchantRoomName(): string {
    return this.merchantRoom;
  }

  getCustomerRoomName(): string {
    return this.customerRoom;
  }
}
