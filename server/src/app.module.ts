import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { User } from './entities/users/user.entity';
import { Product } from './entities/products/product.entity';
import { ProductModule } from './product/product.module';
import { Chat } from './entities/chats/chat.entity';
import { SocketModule } from './chat/socket.module';
import { OrderModule } from './order/order.module';
import { OrderProduct } from './entities/order-product/order-product.entity';
import { Order } from './entities/orders/order.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'nestuser',
      password: 'rootpassword',
      database: 'nestdb',
      entities: [User, Product, Chat, OrderProduct, Order],
      synchronize: true,
      logging: true,
    }),
    AuthModule,
    ProductModule,
    SocketModule,
    OrderModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
