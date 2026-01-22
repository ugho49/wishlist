import { Body, Controller, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Public } from '@wishlist/api/auth'
import { ResetPasswordInputDto, ResetPasswordValidationInputDto } from '@wishlist/common'

import { CreatePasswordVerificationUseCase } from '../../application/command/create-password-verification.use-case'
import { ResetUserPasswordUseCase } from '../../application/command/reset-user-password.use-case'

@Public()
@ApiTags('User Password Validation')
@Controller('/user/forgot-password')
export class UserPasswordVerificationController {
  constructor(
    private readonly createPasswordVerificationUseCase: CreatePasswordVerificationUseCase,
    private readonly resetUserPasswordUseCase: ResetUserPasswordUseCase,
  ) {}

  @Post('/send-reset-email')
  async sendResetPasswordEmail(@Body() dto: ResetPasswordInputDto): Promise<void> {
    await this.createPasswordVerificationUseCase.execute({ email: dto.email })
  }

  @Post('/reset')
  async resetPassword(@Body() dto: ResetPasswordValidationInputDto): Promise<void> {
    await this.resetUserPasswordUseCase.execute({ email: dto.email, token: dto.token, newPassword: dto.new_password })
  }
}
