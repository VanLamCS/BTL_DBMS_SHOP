import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  Req,
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
import {
  CreateProductDto,
  GetProductsDto,
  SizeDto,
  UpdateProductDto,
} from './product.dto';
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

  @Post('product/restore')
  @ApiBearerAuth()
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBody({
    type: 'json',
    schema: {
      properties: {
        productId: {
          type: 'number',
        },
      },
    },
  })
  async restoreProduct(
    @Body('productId', new ValidationPipe({ transform: true }))
    productId: number,
  ) {
    await this.productService.restoreProduct(productId);
    return ApiResponse.success({ productId }, 'Restored successfully');
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
    return ApiResponse.success(
      { products: res.products, count: res.count },
      'Retrieved products successfully',
    );
  }

  @Get('product/:productId')
  async getProduct(
    @Param('productId', new ValidationPipe({ transform: true }))
    productId: number,
  ) {
    const res = await this.productService.getProduct(productId);
    if (!res) {
      throw new BadRequestException('Product invalid');
    }
    const imageArr = [];
    res.images.map((image) => {
      imageArr.push(image.imageLink);
    });
    res.images = imageArr;
    return ApiResponse.success(
      { product: res },
      'Retrieved product successfully',
    );
  }

  @Put('product/:productId')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UseInterceptors(FilesInterceptor('images'))
  @ApiBody({ type: UpdateProductDto })
  async updateProduct(
    @UploadedFiles() images: Express.Multer.File[],
    @Body() updateProductDto: UpdateProductDto,
    @Param('productId', new ValidationPipe({ transform: true }))
    productId: number,
  ) {
    const updateFields: Array<string> = [];

    // Check sizes
    let sizes = updateProductDto.sizes;
    if (sizes) {
      sizes = this._getSizesFromCreateProductDto(updateProductDto);
      const checkSize = this._checkSizesType(sizes);
      if (checkSize) {
        updateFields.push('sizes');
      } else {
        throw new BadRequestException('Size is invalid');
      }
    }
    // Check name
    if (updateProductDto.name?.length > 0) {
      if (updateProductDto.name.length > 500) {
        throw new BadRequestException('Name is too long');
      }
      updateFields.push('name');
    }
    // Check description
    if (updateProductDto.description?.length > 0) {
      updateFields.push('description');
    }
    // Check images valid
    if (images && images.length > 0) {
      updateFields.push('images');
    }

    const res = await this.productService.updateProduct(
      productId,
      images,
      sizes,
      updateProductDto.name,
      updateProductDto.description,
      updateFields,
    );
    const showSizes = res.sizes.map(({ productId, ...rest }) => rest);
    const showImages = res.images.map(({ imageLink, productId }) => imageLink);
    const showData = { ...res.product, sizes: showSizes, images: showImages };

    return ApiResponse.success({ product: showData }, 'Updated successfully');
  }

  @Delete('product/:productId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(200)
  async deleteProduct(
    @Param('productId', new ValidationPipe({ transform: true }))
    productId: number,
  ): Promise<any> {
    console.log(productId, typeof productId);
    await this.productService.deleteProduct(productId);
    return ApiResponse.success({ productId }, 'Deleted');
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
