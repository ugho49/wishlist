import { Body, Controller, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ResetPasswordInputDto, ResetPasswordValidationInputDto } from '@wishlist/common'

import { Public } from '../../../auth'
import { LegacyPasswordVerificationService } from '../legacy-password-verification.service'

@Public()
@ApiTags('User Password Validation')
@Controller('/user/forgot-password')
export class PasswordVerificationController {
  constructor(private readonly verificationService: LegacyPasswordVerificationService) {}

  @Post('/send-reset-email')
  sendResetPasswordEmail(@Body() dto: ResetPasswordInputDto): Promise<void> {
    return this.verificationService.sendResetEmail(dto)
  }

  @Post('/reset')
  resetPassword(@Body() dto: ResetPasswordValidationInputDto): Promise<void> {
    return this.verificationService.resetPassword(dto)
  }
}
