import type { Algorithm } from 'jsonwebtoken'

import { registerAs } from '@nestjs/config'

export default registerAs('auth', () => ({
  issuer: process.env.AUTH_ISSUER || '',
  accessToken: {
    secret: process.env.AUTH_ACCESS_TOKEN_SECRET || '',
    duration: process.env.AUTH_ACCESS_TOKEN_DURATION || '1h',
    algorithm: (process.env.AUTH_ACCESS_TOKEN_ALGORITHM || 'HS512') as Algorithm,
  },
  refreshToken: {
    secret: process.env.AUTH_REFRESH_TOKEN_SECRET || '',
    duration: process.env.AUTH_REFRESH_TOKEN_DURATION || '1d',
    algorithm: (process.env.AUTH_REFRESH_TOKEN_ALGORITHM || 'HS512') as Algorithm,
  },
}))
