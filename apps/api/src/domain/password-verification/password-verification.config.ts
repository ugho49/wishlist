import { registerAs } from '@nestjs/config';

export default registerAs('passwordVerification', () => {
  return {
    resetPasswordTokenDurationInMinutes: parseInt(process.env.RESET_PASSWORD_TOKEN_DURATION_IN_MIN || '15', 10),
  };
});
