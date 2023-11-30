import {
  BadRequestException,
  Body,
  Controller,
  ParseEnumPipe,
  Post,
  Put,
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
import { CreateOrderDto, UpdateStatusOrderDto } from './order.dto';
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

  @Put('order/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBody({ type: UpdateStatusOrderDto })
  async updateStatusOrder(
    @Body('status', new ValidationPipe()) status: OrderStatus,
    @Body('productId', new ValidationPipe({ transform: true }))
    orderId: number,
  ) {
    if (!Object.values(OrderStatus).includes(status as OrderStatus)) {
      throw new BadRequestException('Status is invalid');
    }
    const res = await this.orderService.updateOrderStatus(orderId, status);
    return ApiResponse.success({ order: res }, 'Updated successfully');
  }
}
