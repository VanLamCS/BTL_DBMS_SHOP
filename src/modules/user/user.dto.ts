import { IsEmail, IsEnum, IsNotEmpty, MinLength } from 'class-validator';
import { Expose } from 'class-transformer';
import { Role } from '../auth/decorator/role';

export class CreateUserDto {
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
  email: string;

  @IsNotEmpty()
  @Expose()
  password: string;
}

export class UserDto {
  @IsNotEmpty()
  userId: number;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @Expose()
  password: string;
  
  @IsNotEmpty()
  role: string;

  @IsNotEmpty()
  token: string;
  
  phone: string;
  avatar: string;
  createdAt: string;
  address: string;
}