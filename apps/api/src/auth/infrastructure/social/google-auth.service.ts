import { Inject, Injectable } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { OAuth2Client } from 'google-auth-library'

import authConfig from '../auth.config'

@Injectable()
export class GoogleAuthService {
  private client: OAuth2Client

  constructor(@Inject(authConfig.KEY) config: ConfigType<typeof authConfig>) {
    const googleConfig = config.social.google

    this.client = new OAuth2Client(googleConfig.clientId, googleConfig.clientSecret, '')
  }

  async verify(token: string) {
    const ticket = await this.client.verifyIdToken({
      idToken: token,
    })
    return ticket.getPayload()
  }
}
