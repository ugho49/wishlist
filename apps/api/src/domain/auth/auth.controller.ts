import { Body, Controller, Ip, Post } from '@nestjs/common';
import { Public } from './decorators/public.metadata';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { LoginInputDto, LoginOutputDto, RefreshTokenInputDto, RefreshTokenOutputDto } from '@wishlist/common-types';

@Public()
@ApiTags('Auth')
@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  login(@Body() dto: LoginInputDto, @Ip() ip: string): Promise<LoginOutputDto> {
    return this.authService.login(dto, ip);
  }

  @Post('/refresh')
  refresh(@Body() dto: RefreshTokenInputDto, @Ip() ip: string): Promise<RefreshTokenOutputDto> {
    return this.authService.refresh(dto, ip);
  }
}
