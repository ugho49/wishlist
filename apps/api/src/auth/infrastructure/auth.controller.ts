import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { LoginInputDto, LoginOutputDto, LoginWithGoogleInputDto } from '@wishlist/common'
import { RealIP } from 'nestjs-real-ip'

import { LoginUseCase } from '../application/use-case/login.use-case'
import { LoginWithGoogleUseCase } from '../application/use-case/login-with-google.use-case'
import { Public } from './decorators/public.metadata'

@Public()
@ApiTags('Auth')
@Controller('/auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly loginWithGoogleUseCase: LoginWithGoogleUseCase,
  ) {}

  @HttpCode(200)
  @Post('/login')
  login(@Body() dto: LoginInputDto, @RealIP() ip: string): Promise<LoginOutputDto> {
    return this.loginUseCase.execute({ email: dto.email, password: dto.password, ip })
  }

  @HttpCode(200)
  @Post('/login/google')
  loginWithGoogle(@Body() dto: LoginWithGoogleInputDto, @RealIP() ip: string): Promise<LoginOutputDto> {
    return this.loginWithGoogleUseCase.execute({ code: dto.code, ip, createUserIfNotExists: dto.createUserIfNotExists })
  }
}
