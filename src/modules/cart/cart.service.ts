import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Carts } from 'src/entities/Carts.entity';
import { Repository } from 'typeorm';
import { AddToCartDto } from './cart.dto';
import { Sizes } from 'src/entities/Sizes.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Carts)
    private readonly cartRepository: Repository<Carts>,
    @InjectRepository(Sizes)
    private readonly sizeRepository: Repository<Sizes>,
  ) {}

  async add(userId: number, addToCartDto: AddToCartDto) {
    // Check exists
    const size = await this.sizeRepository.findOne({
      where: { sizeName: addToCartDto.size, productId: addToCartDto.productId },
      // Lười kiểm tra xem dã bị xoá chưa :vv
    });
    if (!size) {
      throw new BadRequestException('Product is not exists');
    }
    const newData = this.cartRepository.create({
      userId: userId,
      size: addToCartDto.size,
      productId: addToCartDto.productId,
      quantity: addToCartDto.quantity,
    });
    const add = await this.cartRepository.save(newData);
    return add;
  }

  async getManyByUserId(userId: number, limit: number, page: number) {
    const skip = (page - 1) * limit;
    const [items, count] = await this.cartRepository
      .createQueryBuilder('carts')
      .where('carts.userId = :userId', { userId })
      .orderBy('carts.time', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();
    return {items, count};
  }

  async remove(userId: number, cartId: number) {
    return await this.cartRepository.delete({userId: userId, cartId: cartId})
  }
}
