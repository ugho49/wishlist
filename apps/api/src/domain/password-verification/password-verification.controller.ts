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
  sendResetPasswordEmail(@Body() dto: ResetPasswordInputDto): Promise<void> {
    return this.verificationService.sendResetEmail(dto);
  }

  @Post('/reset')
  resetPassword(@Body() dto: ResetPasswordValidationInputDto): Promise<void> {
    return this.verificationService.resetPassword(dto);
  }
}
