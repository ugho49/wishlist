import { Inject, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { OAuth2Client, TokenPayload } from 'google-auth-library'

import authConfig from '../auth.config'

@Injectable()
export class GoogleAuthService {
  private logger = new Logger(GoogleAuthService.name)
  private client: OAuth2Client

  constructor(@Inject(authConfig.KEY) private readonly config: ConfigType<typeof authConfig>) {
    const googleConfig = config.social.google

    this.client = new OAuth2Client({
      clientId: googleConfig.clientId,
      clientSecret: googleConfig.clientSecret,
      redirectUri: 'postmessage',
    })

    this.logger.log('Created Google OAuth2Client', {
      clientId: googleConfig.clientId,
    })
  }

  async getGoogleAccountFromCode(code: string): Promise<TokenPayload> {
    const idToken = await this.exchangeCodeToIdToken(code)

    if (!idToken) {
      throw new UnauthorizedException('Invalid code')
    }

    return this.verify(idToken)
  }

  private async verify(token: string) {
    const ticket = await this.client.verifyIdToken({
      idToken: token,
    })
    const payload = ticket.getPayload()

    if (!payload) {
      throw new UnauthorizedException('Your token is not valid')
    }

    return payload
  }

  private async exchangeCodeToIdToken(code: string) {
    try {
      const response = await this.client.getToken({ code })
      return response.tokens.id_token
    } catch (error) {
      this.logger.error('Error getting token from code', { error })
      throw new InternalServerErrorException('Error getting token from code')
    }
  }
}
