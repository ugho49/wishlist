import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import authSocialConfig from '../auth-social.config';

@Injectable()
export class GoogleAuthService {
  private client: OAuth2Client;
  constructor(@Inject(authSocialConfig.KEY) private readonly config: ConfigType<typeof authSocialConfig>) {
    this.client = new OAuth2Client(config.google.clientId, config.google.clientSecret, '');
  }

  async verify(token: string) {
    const ticket = await this.client.verifyIdToken({
      idToken: token,
    });
    return ticket.getPayload();
  }
}
