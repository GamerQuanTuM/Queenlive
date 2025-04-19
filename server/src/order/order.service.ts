import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/entities/products/product.entity';
import { User } from 'src/entities/users/user.entity';
import { Order, OrderStatus } from 'src/entities/orders/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderProduct } from 'src/entities/order-product/order-product.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderProduct)
    private readonly orderProductRepository: Repository<OrderProduct>,
  ) {}

  async createOrder(userId: number, createOrderDto: CreateOrderDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['name', 'email', 'id', 'createdAt', 'updatedAt', 'role'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { items, status = OrderStatus.PENDING } = createOrderDto;
    let totalAmount = 0;
    const orderProducts: Partial<OrderProduct>[] = [];

    let quantity = 0;
    for (const item of items) {
      if (item.quantity <= 0) {
        throw new BadRequestException('Quantity must be greater than 0');
      }

      const product = await this.productRepository.findOne({
        where: { id: item.productId },
      });
      if (!product) {
        throw new NotFoundException(
          `Product with ID ${item.productId} not found`,
        );
      }

      if (item.quantity > product.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${product.name}`,
        );
      }

      quantity += item.quantity;
    }

    const order = this.orderRepository.create({
      userId,
      user,
      status,
      totalAmount: 0,
      quantity,
    });

    const savedOrder = await this.orderRepository.save(order);

    for (const item of items) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
      });

      if (!product) {
        throw new NotFoundException(
          `Product with ID ${item.productId} not found`,
        );
      }

      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;

      const orderProduct = this.orderProductRepository.create({
        orderId: savedOrder.id,
        productId: product.id,
        quantity: item.quantity,
      });

      orderProducts.push(orderProduct);

      product.quantity -= item.quantity;
      await this.productRepository.save(product);
    }

    await this.orderProductRepository.save(orderProducts);

    savedOrder.totalAmount = totalAmount;
    return this.orderRepository.save(savedOrder);
  }

  async findAll() {
    return this.orderRepository.find({
      relations: ['orderProducts', 'orderProducts.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(orderId: number) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['orderProducts', 'orderProducts.product'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async findAllOrdersOfUser(userId: number) {
    return this.orderRepository.find({
      where: { userId },
      relations: ['orderProducts', 'orderProducts.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOneOrderOfUser(userId: number, orderId: number) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, userId },
      relations: ['orderProducts', 'orderProducts.product'],
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async updateStatus(userId: number, orderId: number, status: OrderStatus) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, userId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot update a cancelled order');
    }

    if (order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException('Cannot update a delivered order');
    }

    order.status = status;
    return this.orderRepository.save(order);
  }

  async cancelOrder(userId: number, orderId: number) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId, userId },
      relations: ['orderProducts'],
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order is already cancelled');
    }

    if (order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException('Cannot cancel a delivered order');
    }

    // Restore product quantities
    for (const orderProduct of order.orderProducts) {
      const product = await this.productRepository.findOne({
        where: { id: orderProduct.productId },
      });

      if (product) {
        product.quantity += orderProduct.quantity;
        await this.productRepository.save(product);
      }
    }

    order.status = OrderStatus.CANCELLED;
    return this.orderRepository.save(order);
  }

  async remove(userId: number, orderId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const order = await this.orderRepository.findOne({
      where: { id: orderId, userId: user.id },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    await this.orderRepository.delete(orderId);
    return { message: 'Order deleted successfully' };
  }
}
