import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import {
  LoginInputDto,
  LoginOutputDto,
  LoginWithGoogleInputDto,
  RefreshTokenInputDto,
  RefreshTokenOutputDto,
} from '@wishlist/common'
import { RealIP } from 'nestjs-real-ip'

import { AuthService } from './auth.service'
import { Public } from './decorators/public.metadata'

@Public()
@ApiTags('Auth')
@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(200)
  @Post('/login')
  login(@Body() dto: LoginInputDto, @RealIP() ip: string): Promise<LoginOutputDto> {
    return this.authService.login(dto, ip)
  }

  @HttpCode(200)
  @Post('/login/google')
  loginWithGoogle(@Body() dto: LoginWithGoogleInputDto, @RealIP() ip: string): Promise<LoginOutputDto> {
    return this.authService.loginWithGoogle(dto, ip)
  }

  @HttpCode(200)
  @Post('/refresh')
  refresh(@Body() dto: RefreshTokenInputDto, @RealIP() ip: string): Promise<RefreshTokenOutputDto> {
    return this.authService.refresh(dto, ip)
  }
}
