import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async login(loginData: LoginDto) {
    const user = await this.usersService.getUserByEmail(
      loginData.email.toLowerCase().trim(),
    );
    if (user) {
      const validPassword = await bcrypt.compare(
        loginData.password,
        user.password,
      );
      if (validPassword) {
        return user;
      }
    }
    throw new HttpException('Invalid Credentials', HttpStatus.UNAUTHORIZED);
  }
}
