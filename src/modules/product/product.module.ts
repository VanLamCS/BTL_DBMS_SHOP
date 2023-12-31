import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Products } from 'src/entities/Products.entity';
import { Sizes } from 'src/entities/Sizes.entity';
import { Images } from 'src/entities/Images.entity';
import { UploadModule } from '../upload/upload.module';
import { RatingModule } from '../rating/rating.module';

@Module({
  imports: [TypeOrmModule.forFeature([Products, Sizes, Images]), UploadModule, RatingModule],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
