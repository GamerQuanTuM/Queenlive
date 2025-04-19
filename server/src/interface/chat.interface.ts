import { UserType } from './user.interface';

export interface ChatType {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  content: string;
  senderId: number;
  receiverId: number;
  sender?: UserType;
  receiver?: UserType;
}
