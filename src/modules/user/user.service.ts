import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CreateUserDto,
  CreateUserWithRoleDto,
  GetUsersDto,
  LoginUserDto,
} from './user.dto';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Users } from 'src/entities/Users.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
  ) {}

  async findOneByEmail(email: string): Promise<Users | undefined> {
    return this.userRepository.findOne({ where: { email } });
  }

  async createUser(createUserDto: CreateUserDto): Promise<Users | undefined> {
    createUserDto.password = await bcrypt.hash(
      createUserDto.password,
      parseInt(process.env.HASH_SALT),
    );
    const { name, email, password } = createUserDto;
    // Check exists
    const userInDb = await this.userRepository.findOneBy({ email });
    if (userInDb) {
      throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
    }
    // Send mail service (not implement)
    // Create user
    const newUser = this.userRepository.create({ name, email, password });
    return this.userRepository.save(newUser);
  }

  async createAdmin(
    createAdminDto: CreateUserWithRoleDto,
  ): Promise<Users | undefined> {
    createAdminDto.password = await bcrypt.hash(
      createAdminDto.password,
      parseInt(process.env.HASH_SALT),
    );
    const { name, email, password, role } = createAdminDto;
    // Check exists
    const userInDb = await this.userRepository.findOneBy({ email });
    if (userInDb) {
      throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
    }
    // Send mail service (not implement)
    // Create user
    const newUser = this.userRepository.create({ name, email, password, role });
    return this.userRepository.save(newUser);
  }

  async findByLogin(loginData: LoginUserDto) {
    const { email, password } = loginData;
    let user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new HttpException('User is not exists', HttpStatus.UNAUTHORIZED);
    }
    const is_equal_password = await bcrypt.compare(password, user.password);
    if (!is_equal_password) {
      throw new HttpException(
        'Email or password is incorrect',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return user;
  }

  async findByEmail(email: string) {
    return await this.userRepository.findBy({ email });
  }

  async findById(userId: number) {
    return await this.userRepository.findOneBy({ userId });
  }

  async updateById(userId, updateData) {
    const updated = await this.userRepository
      .createQueryBuilder()
      .update(Users)
      .set(updateData)
      .where('userId = :userId', { userId: userId })
      .execute();
    if (updated.affected && updated.affected > 0) {
      return this.userRepository.findOne({ where: { userId } });
    }
  }

  async getUsers(option: GetUsersDto): Promise<Users[]> {
    const users = await this.userRepository.find({
      take: option.limit,
      skip: (option.page - 1) * option.limit,
    });
    return users;
  }
}
