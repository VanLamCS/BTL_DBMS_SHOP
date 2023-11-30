import { Module } from '@nestjs/common';
import { RatingController } from './rating.controller';
import { RatingService } from './rating.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usersratingproducts } from 'src/entities/Usersratingproducts.entity';
import { Products } from 'src/entities/Products.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Usersratingproducts, Products])],
  controllers: [RatingController],
  providers: [RatingService],
  exports: [RatingService],
})
export class RatingModule {}
