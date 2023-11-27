import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../../entities/Users.entity';
import { UserController } from './user.controller';
import { JwtStrategy } from '../auth/strategy/auth.strategy';
import { JwtModule } from '@nestjs/jwt';
import { UploadService } from '../upload/upload.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.TOKEN_EXPIRES_IN },
    }),
  ],
  controllers: [UserController],
  providers: [UserService, JwtStrategy, UploadService],
  exports: [UserService],
})
export class UserModule {}
