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
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiTags,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { SelfGuard } from '../auth/guard/self.guard';
import { plainToInstance } from 'class-transformer';
import { GetUsersDto, UpdateUserDto, UserDto, cleanDto } from './user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from '../upload/upload.service';
import { JwtAuthGuard } from '../auth/guard/jwt.guard';
import { Role } from '../auth/decorator/role';
import { RolesGuard } from '../auth/guard/role.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { ApiResponse } from 'src/utils/api-response';

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
      const user = await this.userService.findById(id);
      return ApiResponse.success(
        {
          user: plainToInstance(UserDto, user, {
            excludeExtraneousValues: true,
          }),
        },
        'Retrieved user successfully',
      );
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Get('users')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiQuery({ type: GetUsersDto })
  async getUsers(
    @Query()
    queryOption: Partial<GetUsersDto>,
  ) {
    const option = plainToInstance(GetUsersDto, queryOption, {
      ignoreDecorators: true,
    });
    const users = await this.userService.getUsers(option);
    const usersResponse = users.map((user) =>
      plainToInstance(UserDto, user, { excludeExtraneousValues: true }),
    );
    return ApiResponse.success(
      { users: usersResponse },
      'Retrieved users successfully',
    );
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
    @UploadedFile() avatar: Express.Multer.File,
    @Req() req,
  ) {
    try {
      const user = req.user;
      let avatarUrl: string = '';
      if (this.uploadImageService._checkCondition(avatar)) {
        avatarUrl = await this.uploadImageService.uploadImage(avatar);
      }
      const cleanUpdateUserDto = cleanDto(restBody);
      if (avatarUrl) {
        cleanUpdateUserDto['avatar'] = avatarUrl;
      }
      if (Object.keys(cleanUpdateUserDto).length === 0) {
        throw new BadRequestException('Nothing to update');
      }
      const userUpdated = await this.userService.updateById(
        user.userId,
        cleanUpdateUserDto,
      );
      const userUpdatedShown = plainToInstance(UserDto, userUpdated, {
        excludeExtraneousValues: true,
      });
      return ApiResponse.success(
        { user: userUpdatedShown },
        'Updated successfully',
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
