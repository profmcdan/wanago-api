import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from './interfaces/token.interface';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async authenticate(loginData: LoginDto) {
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

  public getCookieWithJwt(userId: string) {
    const payload: TokenPayload = { userId };
    const token = this.jwtService.sign(payload);
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
      'JWT_EXPIRES_IN',
    )}`;
  }

  public getCookieForLogout() {
    return `Authentication=; HttpOnly; Path=/; Max-Age=0`;
  }
}
