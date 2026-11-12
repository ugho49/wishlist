import { Config, Env } from '@znight/config';

@Config()
export class UserConfig {
  @Env('RESET_PASSWORD_TOKEN_DURATION_IN_MIN') resetPasswordTokenDurationInMinutes!: number;
  @Env('EMAIL_CHANGE_VERIFICATION_TOKEN_DURATION_IN_MIN') emailChangeVerificationTokenDurationInMinutes!: number;
}
