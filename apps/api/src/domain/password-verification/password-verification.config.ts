import { registerAs } from '@nestjs/config';

export default registerAs('passwordVerification', () => ({
  resetPasswordTokenDurationInMinutes: parseInt(process.env.RESET_PASSWORD_TOKEN_DURATION_IN_MIN, 10) || 15,
}));
