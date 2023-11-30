import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateOrderDto, ProductIdAndQuantityDto } from './order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Orders } from 'src/entities/Orders.entity';
import { Products } from 'src/entities/Products.entity';
import { Sizes } from 'src/entities/Sizes.entity';
import { Productsinorders } from 'src/entities/Productsinorders.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Orders)
    private readonly orderRepository: Repository<Orders>,
    @InjectRepository(Products)
    private readonly productRepository: Repository<Products>,
    @InjectRepository(Sizes)
    private readonly sizeRepository: Repository<Sizes>,
    @InjectRepository(Productsinorders)
    private readonly productsinorderRepository: Repository<Productsinorders>,
  ) {}

  async create(createOrderDto: CreateOrderDto) {
    const arrayPros = await this._checkProductsAvailable(
      createOrderDto.products,
    );

    let cost = 0;
    for (const p of arrayPros) {
      cost += p.price * p.quantityPurchased;
    }

    const entityManager = this.orderRepository.manager;

    const result = await entityManager.transaction(
      async (transactionEntityManager) => {
        const newOrder = this.orderRepository.create({
          status: createOrderDto.status,
          phone: createOrderDto.phone,
          cost: cost,
          note: createOrderDto.note,
          address: createOrderDto.address,
          paymentMethod: createOrderDto.paymentMethod,
        });
        const savedOrder = await transactionEntityManager.save(
          Orders,
          newOrder,
        );

        for (const item of createOrderDto.products) {
          const updateResult = await transactionEntityManager.update(
            Sizes,
            { productId: item.productId, sizeName: item.size },
            { quantity: () => `quantity - ${item.quantity}` },
          );
          if (!updateResult.affected) {
            throw new BadRequestException(`Invalid size or quantity`);
          }
        }

        const productsInOrder = [];
        for (const item of createOrderDto.products) {
          const newPIO = new Object({
            productId: item.productId,
            orderId: savedOrder.orderId,
            size: item.size,
            quantity: item.quantity,
          });
          productsInOrder.push(newPIO);
        }
        await transactionEntityManager.save(Productsinorders, productsInOrder);

        return savedOrder;
      },
    );
    return result;
  }

  private async _checkProductsAvailable(
    productIdAndQuantityList: ProductIdAndQuantityDto[],
  ): Promise<Array<any>> {
    const productIdList: Array<number> = productIdAndQuantityList.map(
      (p) => p.productId,
    );
    const query = this.productRepository
      .createQueryBuilder('product')
      .where('product.productId IN (:...ids)', { ids: productIdList })
      .leftJoinAndSelect('product.sizes', 'size');

    const products = await query.getMany();

    const productsFlatten = products.flatMap((product) => {
      const { sizes, ...rest } = product;
      return sizes.map((size) => ({ ...rest, sizes: size }));
    });

    console.log(productsFlatten);

    let arrayPros = [];
    for (const product of productIdAndQuantityList) {
      let valid = false;
      for (const productFlatten of productsFlatten) {
        if (
          product.productId === productFlatten.productId &&
          product.size === productFlatten.sizes.sizeName
        ) {
          valid = true;
          if (product.quantity > productFlatten.sizes.quantity) {
            console.log(product.quantity, productFlatten.sizes.quantity);
            throw new BadRequestException('Out of stock');
          } else {
            arrayPros.push({
              price: productFlatten.sizes.price,
              quantityPurchased: product.quantity,
            });
          }
        }
      }
      if (!valid) {
        throw new BadRequestException('Invalid product');
      }
    }
    return arrayPros;
  }
}
