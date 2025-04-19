import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/users/user.entity';
import * as bcrypt from 'bcrypt';
import { Chat } from 'src/entities/chats/chat.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    private jwtService: JwtService,
  ) {}

  async signUp(name: string, email: string, password: string, role?: UserRole) {
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      role: role ? role : UserRole.CUSTOMER,
    });

    await this.userRepository.save(user);
    const token = this.generateToken(user);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      token,
    };
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      token,
    };
  }

  async getAllUserType(id: number, role: UserRole) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const allUsers = await this.userRepository.find({
      where: { role },
      select: ['id', 'name', 'email', 'createdAt', 'updatedAt', 'role'],
    });

    const enrichedUsers = await Promise.all(
      allUsers.map(async (otherUser) => {
        const lastMessage = await this.chatRepository.findOne({
          where: [
            { sender: { id }, receiver: { id: otherUser.id } },
            { sender: { id: otherUser.id }, receiver: { id } },
          ],
          order: { createdAt: 'DESC' },
          relations: ['sender', 'receiver'],
        });

        return {
          ...otherUser,
          lastMessage: lastMessage
            ? {
                id: lastMessage.id,
                content: lastMessage.content,
                isRead: lastMessage.isRead,
                createdAt: lastMessage.createdAt,
                sentByCurrentUser: lastMessage.sender.id === id,
              }
            : null,
        };
      }),
    );

    return enrichedUsers;
  }

  private generateToken(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return this.jwtService.sign(payload);
  }
}
