// ws-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Socket } from 'socket.io';
import { UserRole } from 'src/entities/users/user.entity';

type AuthenticatedSocket = Socket & {
  user: {
    id: number;
    email: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
  };
};

export const WsUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const client: AuthenticatedSocket = ctx
      .switchToWs()
      .getClient<AuthenticatedSocket>();
    return client['user'];
  },
);
