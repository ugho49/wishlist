import { registerAs } from '@nestjs/config'
import { mapConfigOrThrow } from '@wishlist/common'
import { z } from 'zod'

const schema = z.object({
  RESET_PASSWORD_TOKEN_DURATION_IN_MIN: z.coerce.number(
    'Missing RESET_PASSWORD_TOKEN_DURATION_IN_MIN environment variable',
  ),
  EMAIL_CHANGE_VERIFICATION_TOKEN_DURATION_IN_MIN: z.coerce.number(
    'Missing EMAIL_CHANGE_VERIFICATION_TOKEN_DURATION_IN_MIN environment variable',
  ),
})

export default registerAs('user', () =>
  mapConfigOrThrow(schema, process.env, data => ({
    resetPasswordTokenDurationInMinutes: data.RESET_PASSWORD_TOKEN_DURATION_IN_MIN,
    emailChangeVerificationTokenDurationInMinutes: data.EMAIL_CHANGE_VERIFICATION_TOKEN_DURATION_IN_MIN,
  })),
)
