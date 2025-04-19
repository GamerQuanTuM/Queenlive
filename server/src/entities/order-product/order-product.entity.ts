import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from '../products/product.entity';
import { Order } from '../orders/order.entity';

@Entity('order_product')
export class OrderProduct {
  @PrimaryColumn()
  orderId: number;

  @PrimaryColumn()
  productId: number;

  @PrimaryColumn()
  quantity: number;

  @ManyToOne(() => Order, (order) => order.orderProducts)
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ManyToOne(() => Product, (product) => product.orderProducts)
  @JoinColumn({ name: 'productId' })
  product: Product;
}
