import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { RolesGuard } from '../auth/guard/role.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { Role } from '../auth/decorator/role';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CreateProductDto, GetProductsDto, SizeDto } from './product.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { ApiResponse } from 'src/utils/api-response';

@ApiTags('Product')
@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('product')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBody({ type: CreateProductDto })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images'))
  async createProduct(
    @UploadedFiles(new ValidationPipe())
    images: Express.Multer.File[],
    @Body()
    createProductDto: CreateProductDto,
  ) {
    try {
      if (images.length === 0) {
        throw new BadRequestException('Images must not be empty');
      }
      const sizes = this._getSizesFromCreateProductDto(createProductDto);
      const sizesOk = this._checkSizesType(sizes);
      if (!sizesOk) {
        throw new BadRequestException('Size has wrong data type');
      }
      const sizesDto = this._convertSizesToDtoSizes(sizes);
      if (this._hasDuplicateSizeName(sizesDto)) {
        throw new BadRequestException('Size name must be different');
      }
      this._checkPriceAndQuantity(sizesDto);
      const res = await this.productService.createProduct(
        createProductDto,
        sizesDto,
        images,
      );
      const returnData = {
        productId: res.product.productId,
        name: res.product.name,
        description: res.product.description,
        createdAt: res.product.createdAt,
        sizes: res.sizes,
        images: res.images.map((image) => image.imageLink),
      };
      return ApiResponse.success(
        { product: returnData },
        'Product was created!',
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Get('products')
  async getProducts(
    @Query(new ValidationPipe({ transform: true }))
    getProductsDto: GetProductsDto,
  ) {
    const res = await this.productService.getProducts(getProductsDto);
    res.products.map((product) => {
      const imageArr = [];
      for (const image of product.images) {
        imageArr.push(image.imageLink);
      }
      product.images = imageArr;
    });
    return res.products;
  }

  private _checkSizesType(sizes) {
    const isOk = sizes.every((size) => {
      if (!size) return false;
      if (
        typeof size['sizeName'] !== 'string' ||
        typeof size['quantity'] !== 'number' ||
        typeof size['price'] !== 'number'
      )
        return false;
      return true;
    });
    return isOk;
  }
  private _checkPriceAndQuantity(sizes: SizeDto[]): void {
    for (const size of sizes) {
      if (size.price < 0) {
        throw new BadRequestException(
          'Price must be greater than or equal to 0',
        );
      }
      if (size.quantity < 0) {
        throw new BadRequestException(
          'Quantity must be greater than or equal to 0',
        );
      }
    }
  }
  private _getSizesFromCreateProductDto(createProductDto: CreateProductDto) {
    try {
      const sizesStr = createProductDto.sizes;
      if (!sizesStr) {
        throw new BadRequestException('Sizes must not be empty');
      }
      const sizesArr = JSON.parse('[' + sizesStr + ']');
      return sizesArr;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  private _convertSizesToDtoSizes(sizes): SizeDto[] {
    return sizes.map((size) => new SizeDto(size));
  }
  private _hasDuplicateSizeName(sizes: SizeDto[]): Boolean {
    const sizeNameSet = new Set<string>();
    for (const item of sizes) {
      if (sizeNameSet.has(item.sizeName)) {
        return true;
      } else {
        sizeNameSet.add(item.sizeName);
      }
    }
    return false;
  }
}
