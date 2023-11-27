import {
  Body,
  Post,
  Controller,
  HttpCode,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  CreateUserDto,
  CreateUserWithRoleDto,
  LoginUserDto,
} from '../user/user.dto';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from './guard/jwt.guard';
import { RolesGuard } from './guard/role.guard';
import { Roles } from './decorator/roles.decorator';
import { Role } from './decorator/role';
import { ApiTags, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiBody({ type: CreateUserDto })
  async registerUser(@Body(new ValidationPipe()) createUserDto: CreateUserDto) {
    const registerData = plainToInstance(CreateUserDto, createUserDto, {
      excludeExtraneousValues: true,
    });
    return this.authService.register(registerData);
  }

  @Post('register-admin')
  @ApiBearerAuth()
  @ApiBody({ type: CreateUserDto })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async registerAdminUser(
    @Body(new ValidationPipe()) createUserDto: CreateUserDto,
  ) {
    const registerData = plainToInstance(CreateUserDto, createUserDto, {
      excludeExtraneousValues: true,
    });
    const registerAdminData = <CreateUserWithRoleDto>{
      ...registerData,
      role: Role.ADMIN,
    };
    console.log(registerAdminData);
    return this.authService.registerWithRole(registerAdminData);
  }

  @Post('login')
  @ApiBody({ type: LoginUserDto })
  @HttpCode(200)
  async loginUser(@Body(new ValidationPipe()) loginUserDto: LoginUserDto) {
    const loginData = plainToInstance(LoginUserDto, loginUserDto, {
      excludeExtraneousValues: true,
    });
    return this.authService.login(loginData);
  }
}
