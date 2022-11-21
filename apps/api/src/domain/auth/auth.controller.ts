import { Body, Controller, Post } from '@nestjs/common';
import { Public } from './decorators/public.metadata';
import { AuthService } from './auth.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginInputDto, LoginOutputDto } from '@wishlist/common-types';

@ApiTags('Auth')
@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ApiOperation({ summary: 'Get a access token' })
  @Post('/login')
  async login(@Body() dto: LoginInputDto): Promise<LoginOutputDto> {
    return this.authService.login(dto);
  }
}
