import {
  Controller,
  Post,
  Body,
  HttpCode,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RequestWithUser } from './interfaces/request.interface';
import { Response } from 'express';
import LocalAuthGuard from './guards/local-auth.guard';
import JwtAuthGuard from './guards/jwt-auth.guard';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post('login-local')
  async loginLocal(@Req() request: RequestWithUser, @Res() response: Response) {
    const { user } = request;
    const cookie = this.authService.getCookieWithJwt(user.id);
    response.setHeader('Set-Cookie', cookie);
    user.password = undefined;
    return response.send({
      status: 'Logged in successfully',
      user: user,
    });
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() request: RequestWithUser, @Res() response: Response) {
    response.setHeader('Set-Cookie', this.authService.getCookieForLogout());
    return response.sendStatus(200);
  }

  @Post('login')
  login(@Body() loginData: LoginDto) {
    return this.authService.authenticate(loginData);
  }
}
