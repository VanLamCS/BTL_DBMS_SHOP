import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  validate,
} from 'class-validator';
import {
  Expose,
  Transform,
  plainToClass,
  plainToInstance,
} from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../auth/decorator/role';

export enum SexEnum {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export class CreateUserDto {
  @IsNotEmpty()
  @IsEmail()
  @Expose()
  @ApiProperty({ example: 'vanlam@gmail.com' })
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  @Expose()
  @ApiProperty({ example: '******' })
  password: string;

  @IsNotEmpty()
  @Expose()
  @ApiProperty({ example: 'Le Van Lam' })
  name: string;

  // @IsNotEmpty()
  // @MinLength(6)
  // confirmPassword: string;
}

// Default by Admin
export class CreateUserWithRoleDto {
  @IsNotEmpty()
  @IsEmail()
  @Expose()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  @Expose()
  password: string;

  @IsNotEmpty()
  @Expose()
  name: string;

  @Expose()
  @IsEnum(Role)
  role: Role;

  // @IsNotEmpty()
  // @MinLength(6)
  // confirmPassword: string;
}

export class LoginUserDto {
  @IsNotEmpty()
  @IsEmail()
  @Expose()
  @ApiProperty({ example: 'vanlam@gmail.com' })
  email: string;

  @IsNotEmpty()
  @Expose()
  @ApiProperty({ example: '********' })
  password: string;
}

export class UserDto {
  @IsNotEmpty()
  @ApiProperty({ example: 123 })
  @Expose()
  userId: number;

  @ApiProperty({ example: 'Le Van Lam' })
  @Expose()
  name: string;

  @ApiProperty({ example: 'vanlam@gmail.com' })
  @Expose()
  email: string;

  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: '0999999999' })
  @Expose()
  phone: string;

  @ApiProperty({ type: 'enum', enum: SexEnum, example: SexEnum.MALE })
  @Expose()
  sex: string;

  @ApiProperty({ example: '' })
  @Expose()
  avatar: string;

  @ApiProperty({ example: '' })
  @Expose()
  address: string;

  @ApiProperty({ example: 'customer' })
  @Expose()
  role: string;

  @ApiProperty({ example: '' })
  @Expose()
  createdAt: Date;
}

export class UpdateUserDto {
  @ApiPropertyOptional()
  @ApiProperty()
  @Expose()
  name?: string;

  @Expose()
  email?: string;

  @ApiPropertyOptional()
  @ApiProperty()
  @Expose()
  phone?: string;

  @ApiPropertyOptional()
  @ApiProperty({
    type: 'string',
    format: 'binary',
  })
  @Expose()
  avatar?: any;

  @ApiPropertyOptional()
  @ApiProperty({ type: 'enum', enum: SexEnum, example: SexEnum.MALE })
  @Expose()
  sex?: string;

  @ApiPropertyOptional()
  @ApiProperty()
  @Expose()
  address?: string;

  role?: string;
}

export class GetUsersDto {
  @ApiProperty()
  @ApiPropertyOptional()
  @IsInt()
  @Expose()
  page: number;

  @ApiProperty()
  @ApiPropertyOptional()
  @IsInt()
  @Expose()
  limit: number;

  constructor(partial: Partial<GetUsersDto>) {
    Object.assign(this, partial);
    this.page = partial?.page || 1;
    this.limit = partial?.limit || 24;
  }
}

export function cleanDto(dto) {
  const cleanedDto = {};
  Object.keys(dto).forEach((key) => {
    const value = dto[key];
    if (dto[key] !== undefined && dto[key] !== null && dto[key] !== '') {
      cleanedDto[key] = value;
    }
  });
  return cleanedDto;
}
