import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserPasswordVerificationService } from '../services/user-password-verification.service';
import { Public } from '../../auth';
import { ResetPasswordInputDto, ResetPasswordValidationInputDto } from '@wishlist/common-types';

@Public()
@ApiTags('User Password Validation')
@Controller('/user/forgot-password')
export class UserPasswordVerificationController {
  constructor(private readonly verificationService: UserPasswordVerificationService) {}

  @Post('/send-reset-email')
  async sendResetPasswordEmail(@Body() dto: ResetPasswordInputDto): Promise<void> {
    this.verificationService.sendResetEmail(dto);
  }

  @Post('/reset')
  async resetPassword(@Body() dto: ResetPasswordValidationInputDto): Promise<void> {
    this.verificationService.resetPassword(dto);
  }
}
