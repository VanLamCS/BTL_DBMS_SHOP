import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { RatingService } from './rating.service';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { RolesGuard } from '../auth/guard/role.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { Role } from '../auth/decorator/role';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { CreateRatingDto, GetRatingDto } from './rating.dto';
import { ApiResponse } from 'src/utils/api-response';

@ApiTags('Rating')
@Controller()
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Post('rating')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CUSTOMER)
  @ApiBody({ type: CreateRatingDto })
  async addRating(
    @Body(new ValidationPipe({ transform: true, always: true }))
    createRatingDto: CreateRatingDto,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    const rated = await this.ratingService.create(userId, createRatingDto);
    return ApiResponse.success(
      { rating: rated },
      'You have just successfully reviewed the product',
    );
  }

  @Get('rating/mine')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CUSTOMER)
  async getMyRatings(@Query() qr: GetRatingDto, @Req() req: any) {
    const userId = req.user.userId;
    if (!qr.limit || qr.limit < 0) {
      qr.limit = 24;
    }
    if (!qr.page || qr.page < 1) {
      qr.page = 1;
    }
    const ratedList = await this.ratingService.getMine(
      userId,
      qr.limit,
      qr.page,
    );
    return ApiResponse.success(
      { ratingList: ratedList.ratedList, count: ratedList.count },
      'Retrieved successfully',
    );
  }

  @Get('rating/:productId')
  async getRatingsProduct(
    @Query() qr: GetRatingDto,
    @Param('productId', new ValidationPipe({ transform: true, always: true }))
    productId: number,
  ) {
    if (!qr.limit || qr.limit < 0) {
      qr.limit = 24;
    }
    if (!qr.page || qr.page < 1) {
      qr.page = 1;
    }
    const res = await this.ratingService.getReviewProduct(
      productId,
      qr.limit,
      qr.page,
    );
    return ApiResponse.success(
      {
        ratingList: res.ratedList,
        count: res.count,
        averageStar: res.avgStar.averageStar,
      },
      'Retrieved successfully',
    );
  }

  @Put('rating')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.CUSTOMER)
  @ApiBody({ type: CreateRatingDto })
  async updateRating(
    @Body(new ValidationPipe({ transform: true, always: true }))
    updateRating: CreateRatingDto,
    @Req() req: any,
  ) {
    const userId = req.user.userId;
    const updated = await this.ratingService.update(userId, updateRating)
    return updated;
  }
}
