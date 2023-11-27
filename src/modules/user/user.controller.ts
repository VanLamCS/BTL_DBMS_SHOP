import {
  Controller,
  Get,
  Param,
  UseGuards,
  BadRequestException,
  Put,
  Body,
  ValidationPipe,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiConsumes, ApiTags, ApiBody } from '@nestjs/swagger';
import { SelfGuard } from '../auth/guard/self.guard';
import { plainToInstance } from 'class-transformer';
import { UpdateUserDto, UserDto, cleanDto } from './user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from '../upload/upload.service';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';

@Controller()
@ApiTags('User')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly uploadImageService: UploadService,
  ) {}

  @Get('user/:userId')
  @ApiBearerAuth()
  @UseGuards(SelfGuard)
  async getUser(@Param('userId') userId: string) {
    try {
      const id = parseInt(userId);
      if (isNaN(id)) {
        throw new BadRequestException();
      }
      const user = this.userService.findById(id);
      const userDto = plainToInstance(UserDto, user, {
        excludeExtraneousValues: true,
      });
      return userDto;
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Put('user/profile')
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: UpdateUserDto })
  @UseInterceptors(FileInterceptor('avatar'))
  async updateProfile(
    @Body(new ValidationPipe({ always: false }))
    restBody: Partial<UpdateUserDto>,
    @UploadedFile() avatar: Buffer,
    @Req() req ,
  ) {
    try {
      console.log(req)
      const user = req.user;
      let avatarUrl: string = '';
      if (this.uploadImageService._checkCondition(avatar)) {
        avatarUrl = await this.uploadImageService.uploadImage(avatar);
      }
      const cleanUpdateUserDto = cleanDto(restBody);
      if (avatarUrl) {
        cleanUpdateUserDto['avatar'] = avatarUrl;
      }
      console.log(cleanUpdateUserDto)
      const userUpdated = await this.userService.updateById(
        user.userId,
        cleanUpdateUserDto,
      );
      console.log(userUpdated);
      return userUpdated;
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
