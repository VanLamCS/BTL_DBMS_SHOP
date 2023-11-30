import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../../entities/Users.entity';
import { UserController } from './user.controller';
import { JwtModule } from '@nestjs/jwt';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Users]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.TOKEN_EXPIRES_IN },
    }),
    UploadModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
