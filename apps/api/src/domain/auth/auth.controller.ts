import { Body, Controller, Post } from '@nestjs/common';
import { Public } from './decorators/public.metadata';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import {
  LoginInputDto,
  LoginOutputDto,
  LoginWithGoogleInputDto,
  RefreshTokenInputDto,
  RefreshTokenOutputDto,
} from '@wishlist/common-types';
import { RealIP } from 'nestjs-real-ip';

@Public()
@ApiTags('Auth')
@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  login(@Body() dto: LoginInputDto, @RealIP() ip: string): Promise<LoginOutputDto> {
    return this.authService.login(dto, ip);
  }

  @Post('/login/google')
  loginWithGoogle(@Body() dto: LoginWithGoogleInputDto, @RealIP() ip: string): Promise<LoginOutputDto> {
    return this.authService.loginWithGoogle(dto, ip);
  }

  @Post('/refresh')
  refresh(@Body() dto: RefreshTokenInputDto, @RealIP() ip: string): Promise<RefreshTokenOutputDto> {
    return this.authService.refresh(dto, ip);
  }
}
