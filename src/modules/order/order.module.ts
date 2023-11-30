import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Orders } from 'src/entities/Orders.entity';
import { Products } from 'src/entities/Products.entity';
import { Sizes } from 'src/entities/Sizes.entity';
import { Productsinorders } from 'src/entities/Productsinorders.entity';
import { Usershaveorders } from 'src/entities/Usershaveorders.entity';
import { JwtService } from '@nestjs/jwt';
import { Users } from 'src/entities/Users.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Orders,
      Products,
      Sizes,
      Productsinorders,
      Usershaveorders,
      Users,
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService, JwtService],
  exports: [OrderService],
})
export class OrderModule {}
