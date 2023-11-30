import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRatingDto, GetRatingDto } from './rating.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Usersratingproducts } from 'src/entities/Usersratingproducts.entity';
import { Repository } from 'typeorm';
import { Products } from 'src/entities/Products.entity';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Usersratingproducts)
    private readonly usersratingproductRepository: Repository<Usersratingproducts>,
    @InjectRepository(Products)
    private readonly productRepository: Repository<Products>,
  ) {}

  async create(userId: number, createRatingDto: CreateRatingDto) {
    const had = await this.usersratingproductRepository.findOne({
      where: { userId: userId, productId: createRatingDto.productId },
    });
    if (had) {
      throw new BadRequestException('You have already rated this product');
    }
    const product = await this.productRepository.findOne({
      where: { productId: createRatingDto.productId },
    });
    if (!product) throw new BadRequestException('Product is invalid');
    // Lười kiểm tra xem đã mua sản phẩm này hay chưa luôn :vv
    const newRating = this.usersratingproductRepository.create({
      userId: userId,
      productId: createRatingDto.productId,
      star: createRatingDto.star,
      comment: createRatingDto.comment,
    });
    const rated = await this.usersratingproductRepository.save(newRating);
    return rated;
  }

  async getMine(userId: number, limit: number, page: number) {
    const skip = (page - 1) * page;
    const [ratedList, count] = await this.usersratingproductRepository
      .createQueryBuilder('ratings')
      .where('ratings.userId = :userId', { userId })
      .orderBy('ratings.time', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();
    return { ratedList, count };
  }

  async getReviewProduct(productId: number, limit: number, page: number) {
    const skip = (page - 1) * page;
    const avgStar = await this.usersratingproductRepository
      .createQueryBuilder('products')
      .select('AVG(products.star)', 'averageStar')
      .where('products.productId = :productId', { productId })
      .getRawOne();
    const [ratedList, count] = await this.usersratingproductRepository
      .createQueryBuilder('ratings')
      .where('ratings.productId = :productId', { productId })
      .orderBy('ratings.time', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();
    return { ratedList, count, avgStar };
  }

  async update(userId: number, updateRating: CreateRatingDto) {
    const had = await this.usersratingproductRepository.findOne({
      where: { userId: userId, productId: updateRating.productId },
    });
    if (!had) {
      throw new BadRequestException('Review invalid');
    }
    if (updateRating.comment) {
      had.comment = updateRating.comment;
    }
    if (updateRating.star) {
      had.star = updateRating.star;
    }
    const updated = await this.usersratingproductRepository.save(had);
    return updated;
  }
  async getAvgStar(productId: number): Promise<number | null> {
    const avgS = await this.usersratingproductRepository
      .createQueryBuilder('product')
      .select('AVG(product.star)', 'averageStar')
      .where('product.productId = :productId', { productId })
      .getRawOne();
    return avgS.averageStar;
  }
}
