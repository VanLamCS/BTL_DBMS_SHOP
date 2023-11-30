import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Orders } from 'src/entities/Orders.entity';
import { Products } from 'src/entities/Products.entity';
import { Sizes } from 'src/entities/Sizes.entity';
import { Productsinorders } from 'src/entities/Productsinorders.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Orders, Products, Sizes, Productsinorders]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
