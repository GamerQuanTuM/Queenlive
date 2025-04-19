import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  UseGuards,
  Get,
  HttpCode,
  Param,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';
import { Customer, GetUser, Merchant } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { UserType } from 'src/interface/user.interface';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from 'src/entities/users/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(201)
  async signUp(@Body(ValidationPipe) signUpDto: SignUpDto) {
    const { name, email, password, role } = signUpDto;
    return this.authService.signUp(name, email, password, role);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    const { email, password } = loginDto;
    return this.authService.login(email, password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @HttpCode(200)
  getProfile(@GetUser() user: UserType) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Customer()
  @Get('customer-only')
  customerOnly(@GetUser() user: UserType) {
    return user.role;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Merchant()
  @Get('merchant-only')
  adminOnly(@GetUser() user: UserType) {
    return user.role;
  }

  @HttpCode(200)
  @Get('get-all-users-type/:role')
  @UseGuards(JwtAuthGuard)
  async getAllUserType(
    @GetUser() user: UserType,
    @Param('role') role: UserRole,
  ) {
    return this.authService.getAllUserType(user.id, role);
  }
}
