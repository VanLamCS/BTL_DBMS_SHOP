import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsInstance,
  IsNotEmpty,
  IsNumber,
  IsObject,
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

export class ArraySizesDto {
  @ApiProperty({ type: [SizeDto] })
  @ValidateNested({ each: true })
  sizes: [SizeDto];
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
