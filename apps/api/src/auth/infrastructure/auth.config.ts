import { Config, Env, Secret } from '@znight/config';

/** Authentication settings: JWT access tokens, refresh tokens and Google OAuth. */
@Config('auth')
export class AuthConfig {
  /** AUTH_ISSUER */
  issuer!: string;
  /** AUTH_ACCESS_TOKEN_SECRET */
  @Secret() accessTokenSecret!: string;
  /** AUTH_ACCESS_TOKEN_DURATION, a `ms` duration */
  accessTokenDuration = '15m';
  /** AUTH_ACCESS_TOKEN_ALGORITHM */
  accessTokenAlgorithm: 'HS256' | 'HS384' | 'HS512' = 'HS512';
  /** AUTH_REFRESH_TOKEN_DURATION, a `ms` duration */
  refreshTokenDuration = '30d';
  @Env('GOOGLE_OAUTH_CLIENT_ID') googleClientId!: string;
  @Secret('GOOGLE_OAUTH_CLIENT_SECRET') googleClientSecret!: string;
}
