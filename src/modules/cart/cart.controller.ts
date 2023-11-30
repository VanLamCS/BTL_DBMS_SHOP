import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { AddToCartDto, GetMyCartDto } from './cart.dto';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { RolesGuard } from '../auth/guard/role.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { Role } from '../auth/decorator/role';
import { CartService } from './cart.service';
import { ApiResponse } from 'src/utils/api-response';

@ApiTags('Cart')
@Controller()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('cart')
  @ApiBearerAuth()
  @ApiBody({ type: AddToCartDto })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async addToCart(
    @Body(new ValidationPipe({ transform: true, always: true }))
    addToCartDto: AddToCartDto,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    const res = await this.cartService.add(userId, addToCartDto);
    return ApiResponse.success({ item: res }, 'Added into cart');
  }

  @Get('cart')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async getMyCart(
    @Req() req: any,
    @Query()
    qr: GetMyCartDto,
  ) {
    const userId = req.user.userId;
    if (!qr.limit || qr.limit < 0) {
      qr.limit = 24;
    }
    if (!qr.page || qr.page < 1) {
      qr.page = 1;
    }
    const items = await this.cartService.getManyByUserId(
      userId,
      qr.limit,
      qr.page,
    );
    return ApiResponse.success(
      { items: items.items, count: items.count },
      'Retrieved successfully',
    );
  }

  @Delete('cart/:cartId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async removeItem(
    @Param('cartId', new ValidationPipe({ transform: true })) cartId: number,
    @Req() req: any,
  ) {
    const res = await this.cartService.remove(req.user.userId, cartId);
    if (!res.affected) {
      throw new BadRequestException('Remove item failed');
    }
    return ApiResponse.success(null, 'Removed successfully');
  }
}
