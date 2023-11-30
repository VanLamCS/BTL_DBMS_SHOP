import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { RolesGuard } from '../auth/guard/role.guard';
import { Role } from '../auth/decorator/role';
import { Roles } from '../auth/decorator/roles.decorator';
import { ApiBearerAuth, ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  CreateOrderDto,
  GetMyOrdersDto,
  UpdateStatusOrderDto,
} from './order.dto';
import { OrderStatus } from 'src/constants/consts';
import { ApiResponse } from 'src/utils/api-response';
import { SelfGuard } from '../auth/guard/self.guard';

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
    const res = await this.orderService.create(user.userId, createOrderDto);
    return ApiResponse.success({ order: res }, 'Order successfully');
  }

  @Post('order/cancel/:orderId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async cancelAnOrder(
    @Param('orderId', new ValidationPipe({ transform: true })) orderId: number,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    const res = await this.orderService.cancelAnOrder(userId, orderId);
    return res;
  }

  @Get('my-orders')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async getMyOrders(
    @Req() req: any,
    @Query(new ValidationPipe({ transform: true }))
    getMyOrdersDto: GetMyOrdersDto,
  ) {
    const user = req.user;
    getMyOrdersDto.limit = getMyOrdersDto?.limit
      ? typeof getMyOrdersDto.limit !== 'number'
        ? parseInt(getMyOrdersDto.limit)
        : 24
      : 24;
    getMyOrdersDto.page = getMyOrdersDto?.page
      ? typeof getMyOrdersDto.page !== 'number'
        ? parseInt(getMyOrdersDto.page)
        : 1
      : 1;
    if (getMyOrdersDto.limit < 0) {
      getMyOrdersDto.limit = 24;
    }
    if (getMyOrdersDto.page < 1) {
      getMyOrdersDto.page = 1;
    }
    if (!['ASC', 'DESC'].includes(getMyOrdersDto.orderBy)) {
      getMyOrdersDto.orderBy = 'DESC';
    }
    const data = await this.orderService.getOrdersOfSomeone(
      user.userId,
      getMyOrdersDto,
    );
    const orders = data.orders.map((item) => {
      const { order, ...rest } = item;
      return order;
    });
    return ApiResponse.success(
      { orders: orders, count: data.count },
      'Retrieved orders successfully',
    );
  }

  @Get('order/:orderId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async getDetailOrder(
    @Param('orderId', new ValidationPipe({ transform: true })) orderId: number,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    const res = await this.orderService.getDetailOrder(userId, orderId);
    let productsInOrder = [];
    res.productsinorders.forEach((item) => {
      const images = [];
      for (const image of item.product.images) {
        images.push(image.imageLink);
      }
      const product = {
        productId: item.productId,
        size: item.size,
        quantity: item.quantity,
        name: item.product.name,
        description: item.product.description,
        images: images,
      };
      productsInOrder.push(product);
    });
    return ApiResponse.success(
      { order: { ...res, productsinorders: productsInOrder } },
      'Retrieved order information successfully',
    );
  }

  @Put('order/status')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBody({ type: UpdateStatusOrderDto })
  async updateStatusOrder(
    @Body('status', new ValidationPipe()) status: OrderStatus,
    @Body('orderId', new ValidationPipe({ transform: true }))
    orderId: number,
  ) {
    if (!Object.values(OrderStatus).includes(status as OrderStatus)) {
      throw new BadRequestException('Status is invalid');
    }
    const res = await this.orderService.updateOrderStatus(orderId, status);
    return ApiResponse.success({ order: res }, 'Updated successfully');
  }
}
