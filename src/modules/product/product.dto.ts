import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

export class SizeDto {
  @ApiProperty({ example: 'S' })
  @IsString()
  @IsNotEmpty()
  sizeName: string;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  quantity: number;

  @ApiProperty({ example: 120000 })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  price: number;

  constructor(objectData) {
    (this.sizeName = objectData.sizeName),
      (this.quantity = objectData.quantity),
      (this.price = objectData.price);
  }
}

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @ApiProperty({ type: [SizeDto] })
  @ValidateNested({ each: true })
  @IsNotEmpty()
  @Type(() => SizeDto)
  sizes: SizeDto[];

  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
  })
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  images: any;
}

export class GetProductsDto {
  @ApiPropertyOptional({
    type: 'enum',
    enum: ['price', 'created' /* , 'order' */],
    default: 'created',
  })
  sortBy: string;

  @ApiPropertyOptional({ type: 'enum', enum: ['ASC', 'DESC'], default: 'ASC' })
  orderBy: string;

  @ApiPropertyOptional({ type: 'number', minimum: 0 })
  minPrice: number;

  @ApiPropertyOptional({ type: 'number', minimum: 0 })
  maxPrice: number;

  @ApiPropertyOptional({ type: 'number', minimum: 1 })
  page: number;

  @ApiPropertyOptional({ type: 'number', minimum: 0 })
  limit: number;

  // @ApiPropertyOptional({ type: 'array', items: { type: 'string' } })
  // categories: [string];
  static transformFloat(value: any): number {
    return parseFloat(value);
  }
  static transformInt(value: any): number {
    return parseFloat(value);
  }
}

export class UpdateProductDto {
  @ApiPropertyOptional()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  description: string;

  @IsArray()
  @ApiPropertyOptional({ type: [SizeDto] })
  @ValidateNested({ each: true })
  @Type(() => SizeDto)
  sizes: SizeDto[];

  @ApiPropertyOptional({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
  })
  @IsArray()
  @ValidateNested({ each: true })
  images: any;
}
