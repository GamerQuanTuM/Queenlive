import { Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { SocketGateway } from './socket.gateway';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/users/user.entity';
import { WsAuthGuard } from './ws-auth.guard';
import { Product } from 'src/entities/products/product.entity';
import { Chat } from 'src/entities/chats/chat.entity';
import { ProductModule } from 'src/product/product.module';
import { OrderModule } from 'src/order/order.module';
import { ChatController } from './chat.contoller';

@Module({
  imports: [
    JwtModule.register({
      secret: 'your-secret-key',
      signOptions: { expiresIn: '1d' },
    }),
    TypeOrmModule.forFeature([User, Product, Chat]),
    ProductModule,
    OrderModule,
  ],
  providers: [SocketGateway, SocketService, WsAuthGuard],
  controllers: [ChatController],
})
export class SocketModule {}
