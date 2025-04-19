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
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        entities: [User, Product, Chat, OrderProduct, Order],
        synchronize:
          config.get<string>('NODE_ENV') === 'production' ? false : true,
        logging: config.get<string>('NODE_ENV') === 'production' ? false : true,
        ssl:
          config.get<string>('NODE_ENV') === 'production'
            ? { rejectUnauthorized: false }
            : false,
      }),
    }),
    AuthModule,
    ProductModule,
    SocketModule,
    OrderModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
