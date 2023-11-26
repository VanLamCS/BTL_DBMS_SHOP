import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { Role } from '../auth/decorator/role';
import { Roles } from '../auth/decorator/roles.decorator';
import { RolesGuard } from '../auth/guard/role.guard';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("user/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getUser(@Param('id') userId: string) {
    console.log(userId)
  }
}
