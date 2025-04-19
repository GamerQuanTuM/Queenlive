import { UserRole } from 'src/entities/users/user.entity';
import { ProductType } from './product.interface';
import { ChatType } from './chat.interface';

export interface UserType {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  orders?: ProductType[];
  sentMessages?: ChatType[];
  receivedMessages?: ChatType[];
}
