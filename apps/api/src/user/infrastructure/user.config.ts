import { registerAs } from '@nestjs/config'

export default registerAs('user', () => {
  return {
    resetPasswordTokenDurationInMinutes: parseInt(process.env.RESET_PASSWORD_TOKEN_DURATION_IN_MIN || '15', 10),
    renewUrl: process.env.RESET_PASSWORD_RENEW_URL || '',
  }
})
