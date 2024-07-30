import * as process from 'process'

import { registerAs } from '@nestjs/config'

export default registerAs('auth-social', () => ({
  google: {
    clientId: process.env.GOOGLE_OAUTH_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || '',
  },
}))
