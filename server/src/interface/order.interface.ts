import { OrderStatus } from 'src/entities/orders/order.entity';
import { OrderProductType } from './order-product.interface';
import { UserType } from './user.interface';

export interface OrderType {
  id: number;
  userId: number;
  user: UserType;
  status: OrderStatus;
  totalAmount: number;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  orderProducts: OrderProductType[];
}
