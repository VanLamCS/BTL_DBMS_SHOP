import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Carts } from 'src/entities/Carts.entity';
import { Sizes } from 'src/entities/Sizes.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Carts, Sizes])
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
