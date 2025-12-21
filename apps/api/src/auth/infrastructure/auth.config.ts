import type { Algorithm } from 'jsonwebtoken'
import type { StringValue } from 'ms'

import { registerAs } from '@nestjs/config'
import { mapConfigOrThrow } from '@wishlist/common'
import { z } from 'zod'

const schema = z.object({
  AUTH_ISSUER: z.string('Missing AUTH_ISSUER environment variable'),
  AUTH_ACCESS_TOKEN_SECRET: z.string('Missing AUTH_ACCESS_TOKEN_SECRET environment variable'),
  AUTH_ACCESS_TOKEN_DURATION: z.string().optional().default('1h'),
  AUTH_ACCESS_TOKEN_ALGORITHM: z.string().optional().default('HS512'),
  GOOGLE_OAUTH_CLIENT_ID: z.string('Missing GOOGLE_OAUTH_CLIENT_ID environment variable'),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string('Missing GOOGLE_OAUTH_CLIENT_SECRET environment variable'),
})

export default registerAs('auth', () =>
  mapConfigOrThrow(schema, process.env, data => ({
    issuer: data.AUTH_ISSUER,
    accessToken: {
      secret: data.AUTH_ACCESS_TOKEN_SECRET,
      duration: data.AUTH_ACCESS_TOKEN_DURATION as StringValue,
      algorithm: data.AUTH_ACCESS_TOKEN_ALGORITHM as Algorithm,
    },
    social: {
      google: {
        clientId: data.GOOGLE_OAUTH_CLIENT_ID,
        clientSecret: data.GOOGLE_OAUTH_CLIENT_SECRET,
      },
    },
  })),
)
