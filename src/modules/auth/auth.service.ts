import { HttpException, HttpStatus, Injectable, Res } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import {
  CreateUserDto,
  CreateUserWithRoleDto,
  LoginUserDto,
} from '../user/user.dto';
import { JwtPayload } from './interfaces/jwt.interface';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const user = await this.userService.createUser(createUserDto);
    const token = await this._createToken(user);
    return {
      email: user.email,
      role: user.role,
      userId: user.userId,
      ...token,
    };
  }

  async registerWithRole(createUserWithRoleDto: CreateUserWithRoleDto) {
    const user = await this.userService.createAdmin(createUserWithRoleDto);
    const token = await this._createToken(user);
    return {
      email: user.email,
      role: user.role,
      ...token,
    };
  }

  async login(loginUserDto: LoginUserDto) {
    try {
      const user = await this.userService.findByLogin(loginUserDto);
      const token = await this._createToken(user);
      return {
        userId: user.userId,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        ...token,
      };
    } catch (error) {
      throw error;
    }
  }

  async handleVerifyToken(token) {
    try {
      const payload = this.jwtService.verify(token);
      return payload['email'];
    } catch (e) {
      throw new HttpException(
        { key: '', data: {}, statusCode: HttpStatus.UNAUTHORIZED },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async validateUser(email) {
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }

  private async _createToken({ email, userId, role }) {
    const accessToken = this.jwtService.sign(
      <JwtPayload>{
        userId,
        email,
        role,
        expiresIn: process.env.TOKEN_EXPIRES_IN,
      },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.TOKEN_EXPIRES_IN,
      },
    );
    return {
      expiresIn: process.env.TOKEN_EXPIRES_IN,
      accessToken,
    };
  }
}
