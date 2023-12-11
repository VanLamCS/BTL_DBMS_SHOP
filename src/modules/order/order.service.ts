import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateOrderDto,
  GetMyOrdersDto,
  ProductIdAndQuantityDto,
} from './order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Orders } from 'src/entities/Orders.entity';
import { Products } from 'src/entities/Products.entity';
import { Sizes } from 'src/entities/Sizes.entity';
import { Productsinorders } from 'src/entities/Productsinorders.entity';
import { OrderStatus } from 'src/constants/consts';
import { Usershaveorders } from 'src/entities/Usershaveorders.entity';
import { ApiResponse } from 'src/utils/api-response';
import { Users } from 'src/entities/Users.entity';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Orders)
    private readonly orderRepository: Repository<Orders>,
    @InjectRepository(Products)
    private readonly productRepository: Repository<Products>,
    // @InjectRepository(Sizes)
    // private readonly sizeRepository: Repository<Sizes>,
    // @InjectRepository(Productsinorders)
    // private readonly productsinorderRepository: Repository<Productsinorders>,
    @InjectRepository(Usershaveorders)
    private readonly usershaveorderRepository: Repository<Usershaveorders>,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
  ) {}

  async create(userId: number, createOrderDto: CreateOrderDto) {
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

        const newUserHaveOrder = this.usershaveorderRepository.create({
          userId: userId,
          orderId: savedOrder.orderId,
        });
        await transactionEntityManager.save(Usershaveorders, newUserHaveOrder);

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

  async updateOrderStatus(orderId: number, status: OrderStatus) {
    const order = await this.orderRepository.findOne({ where: { orderId } });
    if (!order) {
      throw new BadRequestException('Order is invalid');
    }
    order.status = status;
    const updated = this.orderRepository.save(order);
    return updated;
  }

  async getOrdersOfSomeone(userId: number, options: GetMyOrdersDto) {
    let statuses = [
      OrderStatus.PENDING,
      OrderStatus.ACCEPTED,
      OrderStatus.SHIPPING,
      OrderStatus.DONE,
      OrderStatus.CANCELED,
    ];
    if (statuses.includes(options.status)) {
      statuses = [options.status];
    }
    const skip = (options.page - 1) * options.limit;
    const [orders, count] = await this.usershaveorderRepository
      .createQueryBuilder('usershaveorders')
      .where('usershaveorders.userId = :userId', { userId: userId })
      .leftJoinAndSelect('usershaveorders.order', 'orders')
      .andWhere('orders.status IN (:...statuses)', { statuses: statuses })
      .orderBy('orders.orderId', options.orderBy === 'ASC' ? 'ASC' : 'DESC')
      .skip(skip)
      .take(options.limit)
      .getManyAndCount();
    return { orders, count };
  }

  async getOrders(options: GetMyOrdersDto) {
    let statuses = [
      OrderStatus.PENDING,
      OrderStatus.ACCEPTED,
      OrderStatus.SHIPPING,
      OrderStatus.DONE,
      OrderStatus.CANCELED,
    ];
    if (statuses.includes(options.status)) {
      statuses = [options.status];
    }
    const skip = (options.page - 1) * options.limit;
    const [orders, count] = await this.orderRepository
      .createQueryBuilder('orders')
      .where('orders.status IN (:...statuses)', { statuses: statuses })
      .orderBy('orders.orderId', options.orderBy === 'ASC' ? 'ASC' : 'DESC')
      .skip(skip)
      .take(options.limit)
      .getManyAndCount();
    return { orders, count };
  }

  async cancelAnOrder(userId: number, orderId: number) {
    const orderUserHad = await this.usershaveorderRepository.findOne({
      where: { orderId },
    });
    if (!orderUserHad) {
      throw new BadRequestException("User don't have this order");
    }
    const order = await this.orderRepository.findOne({ where: { orderId } });
    if (order.status === OrderStatus.CANCELED) {
      throw new BadRequestException('This order already canceled');
    } else if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException("This order can't cancel");
    }
    order.status = OrderStatus.CANCELED;
    const canceled = await this.orderRepository.save(order);
    return ApiResponse.success({ order: canceled }, 'Canceled successfully');
  }

  async getDetailOrder(userId: number, orderId: number) {
    const orderUserHad = await this.usershaveorderRepository.findOne({
      where: { orderId, userId },
    });
    const user = await this.userRepository.findOne({ where: { userId } });
    if (!user) {
      throw new BadRequestException();
    } else if (user.role !== 'admin') {
      if (!orderUserHad) {
        throw new BadRequestException("User don't have this order");
      }
    }
    const order = await this.orderRepository
      .createQueryBuilder('orders')
      .where('orders.orderId = :orderId', { orderId })
      .leftJoinAndSelect('orders.productsinorders', 'productsinorders')
      .leftJoinAndSelect('productsinorders.product', 'product')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.sizes', 'sizes').andWhere('sizes.sizeName = productsinorders.size')
      .getOne();
    return order;
  }
}
