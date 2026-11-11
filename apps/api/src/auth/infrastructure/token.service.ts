import type { AccessTokenJwtPayload } from '@wishlist/common';

import { Injectable } from '@znight/core';
import { errors, jwtVerify, SignJWT } from 'jose';

import { AuthConfig } from './auth.config';

/** Error names kept from the previous passport-jwt implementation (sent in `UnauthorizedRejection.message`). */
export const TokenError = {
  Missing: 'No auth token',
  Expired: 'TokenExpiredError',
  Invalid: 'JsonWebTokenError',
} as const;

export class InvalidTokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidTokenError';
  }
}

/** Signs and verifies the JWT access tokens (HMAC, `AUTH_ACCESS_TOKEN_ALGORITHM`). */
@Injectable()
export class TokenService {
  private readonly secret: Uint8Array;

  constructor(private readonly config: AuthConfig) {
    this.secret = new TextEncoder().encode(config.accessTokenSecret);
  }

  sign(payload: AccessTokenJwtPayload): Promise<string> {
    return new SignJWT({ ...payload })
      .setProtectedHeader({ alg: this.config.accessTokenAlgorithm, typ: 'JWT' })
      .setIssuedAt()
      .setIssuer(this.config.issuer)
      .setExpirationTime(this.config.accessTokenDuration)
      .sign(this.secret);
  }

  /**
   * Verifies an access token and returns its payload.
   * @throws InvalidTokenError with a {@link TokenError} message
   */
  async verify(token: string): Promise<AccessTokenJwtPayload> {
    try {
      const { payload } = await jwtVerify(token, this.secret, { algorithms: [this.config.accessTokenAlgorithm] });
      return payload as unknown as AccessTokenJwtPayload;
    } catch (error) {
      throw new InvalidTokenError(error instanceof errors.JWTExpired ? TokenError.Expired : TokenError.Invalid);
    }
  }
}
