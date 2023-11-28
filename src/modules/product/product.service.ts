import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Products } from 'src/entities/Products.entity';
import { Sizes } from 'src/entities/Sizes.entity';
import { Repository } from 'typeorm';
import { CreateProductDto, SizeDto } from './product.dto';
import { Images } from 'src/entities/Images.entity';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Products)
    private readonly productRepository: Repository<Products>,
    @InjectRepository(Sizes)
    private readonly sizeRepository: Repository<Sizes>,
    @InjectRepository(Images)
    private readonly imageRepository: Repository<Images>,
    private readonly uploadService: UploadService,
  ) {}
  async createProduct(
    productDataDto: CreateProductDto,
    sizeData: Array<SizeDto>,
    images: Express.Multer.File[],
  ) {
    try {
      const productData = new Products();
      productData.name = productDataDto.name;
      productData.description = productDataDto.description;
      const entityManager = this.productRepository.manager;

      const imagesUploaded = await this.uploadService.uploadImages(images);

      entityManager.transaction(async (transactionEntityManager) => {
        const newProduct = this.productRepository.create(productData);
        const savedProduct = await transactionEntityManager.save(
          Products,
          newProduct,
        );

        const sizesWithProductId = sizeData.map((size) => {
          const sizeData = new Sizes();
          Object.keys(size).forEach((key) => {
            sizeData[key] = size[key];
          });
          sizeData.productId = savedProduct.productId;
          return sizeData;
        });
        const newSizes = this.sizeRepository.create(sizesWithProductId);
        const savedSizes = await transactionEntityManager.save(Sizes, newSizes);

        const imagesWithProductId = imagesUploaded.map((image) => {
          const imageData = new Images();
          imageData.imageLink = image;
          imageData.productId = savedProduct.productId;
          return imageData;
        });
        const newImages = this.imageRepository.create(imagesWithProductId);
        const savedImages = await transactionEntityManager.save(
          Images,
          newImages,
        );

        return { savedProduct, savedSizes, savedImages };
      });
    } catch (e) {
      throw new Error(e.message);
    }
  }
}
