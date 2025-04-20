import { UseGuards } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { SocketService } from './socket.service';
import { Socket, Server } from 'socket.io';
import { WsAuthGuard } from './ws-auth.guard';
import { UserRole } from 'src/entities/users/user.entity';
import { WsUser } from './ws-user.decorator';
import { UserType } from 'src/interface/user.interface';
import { SendMessageDto } from './dto/send-message.dto';
import { MarkAsSeenDto } from './dto/mark-as-seen.dto';
import { OrderService } from 'src/order/order.service';
import { CreateOrderDto } from 'src/order/dto/create-order.dto';

type AuthenticatedSocket = Socket & {
  user: {
    id: number;
    email: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
  };
};

@WebSocketGateway({ cors: { origin: '*' } })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly socketService: SocketService,
    private readonly wsAuthGuard: WsAuthGuard,
    private readonly orderService: OrderService,
  ) {}

  @WebSocketServer() server: Server;

  async handleConnection(client: AuthenticatedSocket) {
    console.log(`Client connected: ${client.id}`);

    try {
      const isAuthenticated = await this.wsAuthGuard.validateClient(client);

      console.log(client.handshake);

      if (isAuthenticated && client['user']) {
        console.log(client['user']);
        this.socketService.addUser(client?.user?.id, client);
        if (client?.user?.role === UserRole.MERCHANT) {
          console.log("Joined Merchant's Room");
          await this.socketService.joinMerchantsRoom(client);
        } else {
          console.log("Joined Customer's Room");
          await this.socketService.joinCustomersRoom(client);
        }
        console.log('Consoling onlineUsers');
        console.log(this.socketService.getConnectedUsers());
        this.server.emit(
          'all-online-users',
          this.socketService.getConnectedUsers(),
        );
        console.log(
          `Authenticated client connected: ${client.id}, user: ${client['user'].id}`,
        );
      } else {
        console.log(`Authentication failed, client disconnected: ${client.id}`);
      }
    } catch (error) {
      console.error('Error during socket authentication:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    console.log(`Client disconnected: ${client.id}`);
    if (client['user']) {
      console.log(client['user']);
      this.socketService.removeUser(client?.user?.id);
      console.log('Consoling onlineUsers');
      console.log(this.socketService.getConnectedUsers());
      this.server.emit(
        'all-online-users',
        this.socketService.getConnectedUsers(),
      );
      console.log(
        `Authenticated client disconnected: ${client.id}, user: ${client['user'].id}`,
      );
    }
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('message')
  async handleMessage(
    @WsUser() sender: UserType,
    @MessageBody() payload: SendMessageDto,
  ) {
    const { receiverId, content } = payload;

    const message = await this.socketService.sendMessage(
      sender.id,
      receiverId,
      content,
    );
    const receiverSocket = this.socketService.getUserSocket(receiverId);
    if (receiverSocket) {
      receiverSocket.emit('message', message);
      return message;
    }
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('new-order-broadcast')
  async sendOrderToMerchants(
    @WsUser() sender: UserType,
    @MessageBody() payload: CreateOrderDto,
  ) {
    const order = await this.orderService.createOrder(sender.id, payload);
    this.server
      .to(this.socketService.getMerchantRoomName())
      .emit(
        'new-order-broadcast',
        `${order.user.name} has placed an order with order-id: ${order.id}`,
      );
    return `${order.user.name} has placed an order with order-id: ${order.id}`;
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(@MessageBody() data: MarkAsSeenDto) {
    const { userId, otherUserId } = data;
    await this.socketService.markMessagesAsRead(otherUserId, userId);

    const senderSocket = this.socketService.getUserSocket(otherUserId);
    if (senderSocket) {
      senderSocket.emit('messagesRead', { readerId: userId });
    }
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('typing')
  handleIsTyping(
    @MessageBody()
    data: {
      userId: number;
      otherUserId: number;
    },
  ) {
    const { userId, otherUserId } = data;
    const receiverSocket = this.socketService.getUserSocket(otherUserId);
    if (receiverSocket) {
      receiverSocket.emit('typing', { userId });
    }
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('stoppedTyping')
  handleStoppedTyping(
    @MessageBody()
    data: {
      userId: number;
      otherUserId: number;
    },
  ) {
    const { userId, otherUserId } = data;
    const receiverSocket = this.socketService.getUserSocket(otherUserId);
    if (receiverSocket) {
      receiverSocket.emit('stoppedTyping', { userId });
    }
  }
}
