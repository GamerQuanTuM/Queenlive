import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { GetUser, Merchant } from 'src/auth/roles.decorator';
import { UserType } from 'src/interface/user.interface';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from 'src/entities/orders/order.entity';
import { RolesGuard } from 'src/auth/roles.guard';

@Controller('order')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @HttpCode(201)
  async create(
    @GetUser() user: UserType,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return await this.orderService.createOrder(user.id, createOrderDto);
  }

  @Get()
  @HttpCode(200)
  async findAll() {
    return await this.orderService.findAll();
  }

  @Get(':id')
  @HttpCode(200)
  async findOne(id: number) {
    return await this.orderService.findOne(id);
  }

  @Get('user-orders')
  @HttpCode(200)
  async findAllOrdersOfUser(@GetUser() user: UserType) {
    return await this.orderService.findAllOrdersOfUser(user.id);
  }

  @Get('user-orders/:id')
  @HttpCode(200)
  async findOneOrderOfUser(@GetUser() user: UserType, id: number) {
    return await this.orderService.findOneOrderOfUser(user.id, id);
  }

  @Put(':id')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Merchant()
  async updateStatus(
    @GetUser() user: UserType,
    id: number,
    status: OrderStatus,
  ) {
    return await this.orderService.updateStatus(user.id, id, status);
  }

  @Put('cancel/:id')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Merchant()
  async cancelOrder(@GetUser() user: UserType, id: number) {
    return await this.orderService.cancelOrder(user.id, id);
  }

  @Delete(':id')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Merchant()
  async remove(@GetUser() user: UserType, id: number) {
    return await this.orderService.remove(user.id, id);
  }
}
