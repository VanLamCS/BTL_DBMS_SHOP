import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Products } from 'src/entities/Products.entity';
import { Sizes } from 'src/entities/Sizes.entity';
import { Repository } from 'typeorm';
import { CreateProductDto, GetProductsDto, SizeDto } from './product.dto';
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

      const result = await entityManager.transaction(
        async (transactionEntityManager) => {
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
          const savedSizes = await transactionEntityManager.save(
            Sizes,
            newSizes,
          );

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
          return {
            product: savedProduct,
            sizes: savedSizes,
            images: savedImages,
          };
        },
      );
      return result;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async getProducts(getProductsDto: GetProductsDto) {
    try {
      let query = this.productRepository.createQueryBuilder('product');
      query.leftJoinAndSelect('product.sizes', 'size');
      let orderBy: 'ASC' | 'DESC' = 'ASC';
      if (getProductsDto.orderBy === 'DESC') {
        orderBy = 'DESC';
      }
      let page = getProductsDto.page;
      if (!page) {
        page = 1;
      } else {
        page = GetProductsDto.transformInt(page);
      }
      let limit = getProductsDto.limit;
      if (!limit) {
        limit = 24;
      } else {
        limit = GetProductsDto.transformInt(limit);
      }
      switch (getProductsDto.sortBy) {
        case 'price':
          query = query.orderBy('size.price', orderBy);
          break;
        case 'created':
          query = query.orderBy('product.createdAt', orderBy);
          break;
        // case 'order':
        //   break;
        default:
          query = query.orderBy('product.createdAt', orderBy);
          break;
      }
      if (getProductsDto['minPrice'] || getProductsDto['maxPrice']) {
        query.andWhere((qb) => {
          if (getProductsDto['minPrice']) {
            qb.andWhere('sizes.price >= :minPrice', {
              minPrice: GetProductsDto.transformFloat(
                getProductsDto['minPrice'],
              ),
            });
          }
          if (getProductsDto['maxPrice']) {
            qb.andWhere('sizes.price <= :maxPrice', {
              maxPrice: GetProductsDto.transformFloat(
                getProductsDto['maxPrice'],
              ),
            });
          }
        });
      }
      if (getProductsDto['minPrice']) {
        query.andWhere('sizes.price >= :minPrice', {
          minPrice: GetProductsDto.transformFloat(getProductsDto['minPrice']),
        });
      }
      if (getProductsDto['maxPrice']) {
        query.andWhere('sizes.price <= :maxPrice', {
          maxPrice: GetProductsDto.transformFloat(getProductsDto['maxPrice']),
        });
      }
      query.innerJoinAndSelect('product.images', 'image');
      const skip = (page - 1) * limit;
      query = query.skip(skip).take(limit);
      const [products, count] = await query.getManyAndCount();
      return { products: products, count: count };
    } catch (e) {
      throw new Error(e.message);
    }
  }
}
