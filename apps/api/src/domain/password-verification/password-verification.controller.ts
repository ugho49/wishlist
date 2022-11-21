import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PasswordVerificationService } from './password-verification.service';
import { Public } from '../auth';
import { ResetPasswordInputDto, ResetPasswordValidationInputDto } from '@wishlist/common-types';

@Public()
@ApiTags('User Password Validation')
@Controller('/user/forgot-password')
export class PasswordVerificationController {
  constructor(private readonly verificationService: PasswordVerificationService) {}

  @Post('/send-reset-email')
  async sendResetPasswordEmail(@Body() dto: ResetPasswordInputDto): Promise<void> {
    await this.verificationService.sendResetEmail(dto);
  }

  @Post('/reset')
  async resetPassword(@Body() dto: ResetPasswordValidationInputDto): Promise<void> {
    await this.verificationService.resetPassword(dto);
  }
}
