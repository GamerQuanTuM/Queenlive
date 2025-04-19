import {
  SetMetadata,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { UserRole } from '../entities/users/user.entity';
import { Request } from 'express';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

export const Merchant = () => SetMetadata(ROLES_KEY, [UserRole.MERCHANT]);
export const Customer = () => SetMetadata(ROLES_KEY, [UserRole.CUSTOMER]);

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user;
  },
);
