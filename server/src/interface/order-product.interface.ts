import { OrderType } from './order.interface';
import { ProductType } from './product.interface';

export interface OrderProductType {
  orderId: number;
  order: OrderType;
  productId: number;
  product: ProductType;
  quantity: number;
}
