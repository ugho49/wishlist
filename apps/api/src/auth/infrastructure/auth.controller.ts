import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiTags } from '@nestjs/swagger'
import { LoginInputDto, LoginOutputDto, LoginWithGoogleInputDto } from '@wishlist/common'
import { RealIP } from 'nestjs-real-ip'

import { LoginCommand, LoginWithGoogleCommand } from '../domain'
import { Public } from './decorators/public.metadata'

@Public()
@ApiTags('Auth')
@Controller('/auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @HttpCode(200)
  @Post('/login')
  login(@Body() dto: LoginInputDto, @RealIP() ip: string): Promise<LoginOutputDto> {
    return this.commandBus.execute(new LoginCommand({ email: dto.email, password: dto.password, ip }))
  }

  @HttpCode(200)
  @Post('/login/google')
  loginWithGoogle(@Body() dto: LoginWithGoogleInputDto, @RealIP() ip: string): Promise<LoginOutputDto> {
    return this.commandBus.execute(
      new LoginWithGoogleCommand({ code: dto.code, ip, createUserIfNotExists: dto.createUserIfNotExists }),
    )
  }
}
