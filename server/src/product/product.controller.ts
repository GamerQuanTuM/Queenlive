import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { GetUser, Merchant } from 'src/auth/roles.decorator';
import { UserType } from 'src/interface/user.interface';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { RolesGuard } from 'src/auth/roles.guard';

@Controller('product')
@UseGuards(JwtAuthGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Merchant()
  @HttpCode(201)
  create(
    @GetUser() user: UserType,
    @Body() createProductDto: CreateProductDto,
  ) {
    return this.productService.create(user.id, createProductDto);
  }

  @Get()
  @HttpCode(200)
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  @HttpCode(200)
  findOne(@Param('id') id: string) {
    return this.productService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Merchant()
  @HttpCode(200)
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(+id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Merchant()
  @HttpCode(200)
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }
}
