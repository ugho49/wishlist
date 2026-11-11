import { Injectable } from '@znight/core';
import { InternalServerErrorException, UnauthorizedException } from '@znight/http';
import { getLogger } from '@znight/observability';
import { OAuth2Client, type TokenPayload } from 'google-auth-library';

import { AuthConfig } from '../auth.config';

@Injectable()
export class GoogleAuthService {
  private readonly logger = getLogger(GoogleAuthService.name);
  private readonly client: OAuth2Client;

  constructor(config: AuthConfig) {
    this.client = new OAuth2Client({
      clientId: config.googleClientId,
      clientSecret: config.googleClientSecret,
      redirectUri: 'postmessage',
    });

    this.logger.info('Created Google OAuth2Client', {
      clientId: config.googleClientId,
    });
  }

  async getGoogleAccountFromCode(code: string): Promise<TokenPayload> {
    this.logger.info('Exchange code to ID token...');
    const idToken = await this.exchangeCodeToIdToken(code);

    if (!idToken) {
      throw new UnauthorizedException('Invalid code');
    }

    return this.verify(idToken);
  }

  private async verify(token: string) {
    this.logger.info('Verifying ID token...');
    const ticket = await this.client.verifyIdToken({
      idToken: token,
    });
    const payload = ticket.getPayload();

    if (!payload) {
      throw new UnauthorizedException('Your token is not valid');
    }

    return payload;
  }

  private async exchangeCodeToIdToken(code: string) {
    try {
      const response = await this.client.getToken({ code });
      return response.tokens.id_token;
    } catch (error) {
      throw new InternalServerErrorException('Error getting token from code', undefined, { cause: error });
    }
  }
}
