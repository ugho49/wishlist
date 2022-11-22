import { Body, Controller, Ip, Post } from '@nestjs/common';
import { Public } from './decorators/public.metadata';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { LoginInputDto, LoginOutputDto } from '@wishlist/common-types';

@ApiTags('Auth')
@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/login')
  async login(@Body() dto: LoginInputDto, @Ip() ip: string): Promise<LoginOutputDto> {
    return this.authService.login(dto, ip);
  }
}
