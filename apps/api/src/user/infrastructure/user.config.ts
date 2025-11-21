import { registerAs } from '@nestjs/config'
import { z } from 'zod'

const schema = z.object({
  RESET_PASSWORD_TOKEN_DURATION_IN_MIN: z.coerce.number(
    'Missing RESET_PASSWORD_TOKEN_DURATION_IN_MIN environment variable',
  ),
  EMAIL_CHANGE_VERIFICATION_TOKEN_DURATION_IN_MIN: z.coerce.number(
    'Missing EMAIL_CHANGE_VERIFICATION_TOKEN_DURATION_IN_MIN environment variable',
  ),
})

export default registerAs('user', () => {
  const result = schema.safeParse(process.env)

  if (!result.success) {
    throw new Error(z.prettifyError(result.error))
  }

  const validatedConfig = result.data

  return {
    resetPasswordTokenDurationInMinutes: validatedConfig.RESET_PASSWORD_TOKEN_DURATION_IN_MIN,
    emailChangeVerificationTokenDurationInMinutes: validatedConfig.EMAIL_CHANGE_VERIFICATION_TOKEN_DURATION_IN_MIN,
  }
})
