import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString, MaxLength, Min } from 'class-validator';

export class AddToCartDto {
  @ApiProperty()
  @IsNumber()
  productId: number;

  @ApiProperty({ example: 'S' })
  @IsString()
  @MaxLength(10)
  size: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  quantity: number;
}

export class GetMyCartDto {
  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  limit: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(1)
  page: number;
}

export class UpdateCartDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  quantity: number;
}
