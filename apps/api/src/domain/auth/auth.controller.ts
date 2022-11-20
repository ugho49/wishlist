import { Body, Controller, Post } from '@nestjs/common';
import { Public } from './decorator/public.metadata';
import { AuthService } from './auth.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginOutputDto, LoginInputDto } from './auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ApiOperation({ summary: 'Get a access token' })
  @Post('login')
  async login(@Body() dto: LoginInputDto): Promise<LoginOutputDto> {
    return this.authService.login(dto);
  }
}
