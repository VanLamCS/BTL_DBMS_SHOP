import { BadRequestException, Injectable } from '@nestjs/common';
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
      query
        .where('product.deleted != 1')
        .leftJoinAndSelect('product.sizes', 'size');
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

  async getProduct(productId: number) {
    const query = this.productRepository.createQueryBuilder('products');
    query
      .where('products.productId = :productId AND products.deleted != 1', {
        productId,
      })
      .leftJoinAndSelect('products.sizes', 'sizes')
      .leftJoinAndSelect('products.images', 'images');
    const data = await query.getOne();
    return data;
  }

  async deleteProduct(productId: number) {
    const checkProduct = await this.productRepository.findOne({
      where: { productId },
    });
    if (!checkProduct || checkProduct.deleted === 1) {
      throw new BadRequestException('Product invalid');
    }
    return await this.productRepository
      .createQueryBuilder()
      .update(Products)
      .set({ deleted: 1 })
      .where('productId = :productId', { productId })
      .execute();
  }

  async restoreProduct(productId: number) {
    const checkProduct = await this.productRepository.findOne({
      where: { productId },
    });
    if (!checkProduct) {
      throw new BadRequestException('Product invalid');
    } else if (checkProduct.deleted !== 1) {
      throw new BadRequestException('Product already exists');
    }
    return await this.productRepository
      .createQueryBuilder()
      .update(Products)
      .set({ deleted: 0 })
      .where('productId = :productId', { productId })
      .execute();
  }

  async updateProduct(
    productId: number | null,
    images: Express.Multer.File[] | null,
    sizes: SizeDto[] | null,
    name: string | null,
    description: string | null,
    fieldsUpdate: Array<string>,
  ) {
    const entityManager = this.productRepository.manager;
    const product = await entityManager.findOne(Products, {
      where: { productId },
    });
    if (!product) {
      throw new BadRequestException('Product is invalid');
    }
    const result = await entityManager.transaction(
      async (transactionEntityManager) => {
        let imagesUploaded = [];
        // Old info
        const existedImages = await transactionEntityManager.find(Images, {
          where: { productId },
        });
        const existedSizes = await transactionEntityManager.find(Sizes, {
          where: { productId },
        });
        const res = {
          product: product,
          images: existedImages,
          sizes: existedSizes,
        };

        if (fieldsUpdate.includes('images')) {
          imagesUploaded = await this.uploadService.uploadImages(images);
          await transactionEntityManager.remove(existedImages);
          const imagesSaved: Images[] = [];
          for (const image of imagesUploaded) {
            const newImage = await transactionEntityManager.create(Images, {
              productId: productId,
              imageLink: image,
            });
            const imageSaved = await transactionEntityManager.save(newImage);
            imagesSaved.push(imageSaved);
          }
          res.images = imagesSaved;
        }
        if (fieldsUpdate.includes('name')) {
          product.name = name;
        }
        if (fieldsUpdate.includes('description')) {
          product.description = description;
        }
        if (fieldsUpdate.includes('sizes')) {
          const sizesSaved: Sizes[] = [];
          await transactionEntityManager.remove(existedSizes);
          for (const size of sizes) {
            const newSize = await transactionEntityManager.create(Sizes, {
              sizeName: size.sizeName,
              price: size.price,
              quantity: size.quantity,
              productId: productId,
            });
            const sizeSaved = await transactionEntityManager.save(newSize);
            sizesSaved.push(sizeSaved);
          }
          res.sizes = sizesSaved;
        }
        await transactionEntityManager.save(product);
        return res;
      },
    );
    return result;
  }
}
