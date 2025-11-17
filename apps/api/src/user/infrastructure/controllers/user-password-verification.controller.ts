import { Body, Controller, Post } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { ApiTags } from '@nestjs/swagger'
import { Public } from '@wishlist/api/auth'
import { AuthThrottle } from '@wishlist/api/core'
import { ResetPasswordInputDto, ResetPasswordValidationInputDto } from '@wishlist/common'

import { CreatePasswordVerificationCommand, ResetUserPasswordCommand } from '../../domain'

@Public()
@ApiTags('User Password Validation')
@Controller('/user/forgot-password')
export class UserPasswordVerificationController {
  constructor(private readonly commandBus: CommandBus) {}

  @AuthThrottle()
  @Post('/send-reset-email')
  async sendResetPasswordEmail(@Body() dto: ResetPasswordInputDto): Promise<void> {
    await this.commandBus.execute(new CreatePasswordVerificationCommand({ email: dto.email }))
  }

  @AuthThrottle()
  @Post('/reset')
  async resetPassword(@Body() dto: ResetPasswordValidationInputDto): Promise<void> {
    await this.commandBus.execute(
      new ResetUserPasswordCommand({ email: dto.email, token: dto.token, newPassword: dto.new_password }),
    )
  }
}
