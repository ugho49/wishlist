import type { Algorithm } from 'jsonwebtoken'
import type { StringValue } from 'ms'

import { registerAs } from '@nestjs/config'

export default registerAs('auth', () => ({
  issuer: process.env.AUTH_ISSUER || '',
  accessToken: {
    secret: process.env.AUTH_ACCESS_TOKEN_SECRET || '',
    duration: (process.env.AUTH_ACCESS_TOKEN_DURATION || '1h') as StringValue,
    algorithm: (process.env.AUTH_ACCESS_TOKEN_ALGORITHM || 'HS512') as Algorithm,
  },
  social: {
    google: {
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || '',
    },
  },
}))
