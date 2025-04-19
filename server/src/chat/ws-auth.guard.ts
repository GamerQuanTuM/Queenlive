import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { User, UserRole } from '../entities/users/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client = context.switchToWs().getClient<Socket>();
      return await this.validateClient(client);
    } catch (error: unknown) {
      const client = context.switchToWs().getClient<Socket>();
      console.log(error);
      client.disconnect();
      return false;
    }
  }

  // This method can be called directly from the gateway
  async validateClient(client: Socket): Promise<boolean> {
    try {
      const tokenWithBearer =
        client.handshake.headers.authorization ??
        (client.handshake.auth as { authorization?: string })?.authorization;

      const token = tokenWithBearer?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return false;
      }

      const payload: { sub: number; role: UserRole; email: string } =
        await this.jwtService.verifyAsync(token, {
          secret: 'your-secret-key',
        });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      const userWithOutPassword = user && {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };

      if (!user) {
        client.disconnect();
        return false;
      }

      client['user'] = { ...userWithOutPassword };
      return true;
    } catch (error: unknown) {
      client.disconnect();
      console.log(error);
      return false;
    }
  }
}
