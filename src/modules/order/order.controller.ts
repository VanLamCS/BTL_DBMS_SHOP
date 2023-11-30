import {
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { RolesGuard } from '../auth/guard/role.guard';
import { Role } from '../auth/decorator/role';
import { Roles } from '../auth/decorator/roles.decorator';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { CreateOrderDto } from './order.dto';
import { OrderStatus } from 'src/constants/consts';
import { ApiResponse } from 'src/utils/api-response';

@ApiTags('Order')
@Controller()
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('order')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CUSTOMER)
  @ApiBody({ type: CreateOrderDto })
  async createOrder(
    @Body(new ValidationPipe()) createOrderDto: CreateOrderDto,
    @Req() req: any,
  ) {
    const user = req.user;
    createOrderDto.userId = user.userId;
    createOrderDto.status = OrderStatus.PENDING;
    console.log(createOrderDto);
    const res = await this.orderService.create(createOrderDto);
    return ApiResponse.success({ order: res }, 'Order successfully');
  }
}
