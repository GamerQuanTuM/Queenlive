import { OrderProductType } from './order-product.interface';
import { UserType } from './user.interface';

export interface ProductType {
  id: number;
  user?: UserType;
  userId: number;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
  orderProducts?: OrderProductType[];
}
