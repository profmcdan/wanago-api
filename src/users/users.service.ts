import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async getUserByEmail(email: string) {
    return await this.usersRepository.findOne({
      where: { email: email.toLowerCase().trim() },
    });
  }
  async create(createUserDto: CreateUserDto) {
    if (await this.getUserByEmail(createUserDto.email)) {
      throw new HttpException(
        'User with this email already exists',
        HttpStatus.BAD_REQUEST,
      );
    }
    const hash = await bcrypt.hash(createUserDto.password, 10);
    const newUser = this.usersRepository.create({
      ...createUserDto,
      email: createUserDto.email.toLowerCase().trim(),
      password: hash,
    });
    await this.usersRepository.save(newUser);
    return newUser;
  }

  findAll() {
    return this.usersRepository.find();
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.usersRepository.update(id, updateUserDto);
    const updated = await this.usersRepository.findOne({ where: { id } });
    if (!updated) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.usersRepository.delete(id);
    if (!deleted.affected) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return deleted;
  }
}
