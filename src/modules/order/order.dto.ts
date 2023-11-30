import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { OrderStatus } from 'src/constants/consts';

export class ProductIdAndQuantityDto {
  @ApiProperty({ type: 'number' })
  @IsNumber()
  productId: number;

  @ApiProperty({ type: 'string', example: 'S' })
  @IsString()
  @IsNotEmpty()
  size: string;

  @ApiProperty({ type: 'number', example: 1 })
  @IsNumber()
  @Min(1, { message: 'Quantity must be larger than 0' })
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ type: [ProductIdAndQuantityDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => ProductIdAndQuantityDto)
  products: ProductIdAndQuantityDto[];

  @ApiPropertyOptional()
  @IsString()
  note: string;

  @ApiProperty({ type: 'string', example: '0999999999' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  phone: string;

  @ApiProperty({ type: 'string', example: 'HCM' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ type: 'enum', enum: ['Cash', 'Momo Pay'] })
  @IsNotEmpty()
  paymentMethod: string;

  userId: number;
  status: OrderStatus;
}

export class UpdateStatusOrderDto {
  @ApiProperty({
    type: 'enum',
    enum: OrderStatus,
    example: OrderStatus.PENDING,
  })
  @IsEnum(OrderStatus, { message: 'Status invalid' })
  status: string;

  @ApiProperty()
  productId: number;
}
