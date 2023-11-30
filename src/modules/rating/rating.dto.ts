import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateRatingDto {
  @ApiProperty()
  @IsNumber()
  productId: number;

  @ApiProperty()
  @IsNumber()
  @Min(0, {message: "Star >= 0"})
  @Max(5, {message: "Star <= 5"})
  star: number;

  @ApiProperty()
  @IsString()
  comment: string;
}

export class GetRatingDto {
  @ApiPropertyOptional()
  @IsNumber()
  @Min(0)
  limit: number;

  @ApiPropertyOptional()
  @IsNumber()
  @Min(1)
  page: number;
}
