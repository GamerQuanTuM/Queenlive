import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { ProductModule } from '../product/product.module';
import { Product } from 'src/entities/products/product.entity';
import { User } from 'src/entities/users/user.entity';
import { OrderProduct } from 'src/entities/order-product/order-product.entity';
import { Order } from 'src/entities/orders/order.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, User, OrderProduct, Order]),
    ProductModule,
    AuthModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
