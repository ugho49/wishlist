import type { Algorithm } from 'jsonwebtoken'
import type { StringValue } from 'ms'

import { registerAs } from '@nestjs/config'
import { z } from 'zod'

const schema = z.object({
  AUTH_ISSUER: z.string('Missing AUTH_ISSUER environment variable'),
  AUTH_ACCESS_TOKEN_SECRET: z.string('Missing AUTH_ACCESS_TOKEN_SECRET environment variable'),
  AUTH_ACCESS_TOKEN_DURATION: z.string().optional().default('1h'),
  AUTH_ACCESS_TOKEN_ALGORITHM: z.string().optional().default('HS512'),
  GOOGLE_OAUTH_CLIENT_ID: z.string('Missing GOOGLE_OAUTH_CLIENT_ID environment variable'),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string('Missing GOOGLE_OAUTH_CLIENT_SECRET environment variable'),
})

export default registerAs('auth', () => {
  const result = schema.safeParse(process.env)

  if (!result.success) {
    throw new Error(z.prettifyError(result.error))
  }

  const validatedConfig = result.data

  return {
    issuer: validatedConfig.AUTH_ISSUER,
    accessToken: {
      secret: validatedConfig.AUTH_ACCESS_TOKEN_SECRET,
      duration: validatedConfig.AUTH_ACCESS_TOKEN_DURATION as StringValue,
      algorithm: validatedConfig.AUTH_ACCESS_TOKEN_ALGORITHM as Algorithm,
    },
    social: {
      google: {
        clientId: validatedConfig.GOOGLE_OAUTH_CLIENT_ID,
        clientSecret: validatedConfig.GOOGLE_OAUTH_CLIENT_SECRET,
      },
    },
  }
})
