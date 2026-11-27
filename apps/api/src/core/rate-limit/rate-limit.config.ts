import { Config } from '@znight/config';

export const FIFTEEN_MINUTES_IN_SECONDS = 15 * 60;
export const ONE_HOUR_IN_SECONDS = 60 * 60;
export const ONE_DAY_IN_SECONDS = 24 * ONE_HOUR_IN_SECONDS;

/**
 * Limits of the operations that reveal who has an account, send emails to any address, create
 * accounts or check a password.
 */
@Config('rateLimit')
export class RateLimitConfig {
  /** RATE_LIMIT_USER_BY_EMAIL_PER_USER: account lookups by exact email, per user and per hour */
  userByEmailPerUser = 30;
  /** RATE_LIMIT_USER_BY_EMAIL_PER_IP: account lookups by exact email, per client address and per hour */
  userByEmailPerIp = 60;
  /** RATE_LIMIT_INVITATIONS_PER_USER: event attendees invited or reminded to fill their wishlist, per user and per day */
  invitationsPerUser = 100;
  /** RATE_LIMIT_LOGIN_PER_EMAIL: login attempts on one email, per 15 minutes */
  loginPerEmail = 10;
  /** RATE_LIMIT_LOGIN_PER_IP: login attempts, per client address and per 15 minutes */
  loginPerIp = 30;
  /** RATE_LIMIT_SIGN_UP_PER_IP: sign-up attempts and accounts created with Google, per client address and per hour */
  signUpPerIp = 10;
  /** RATE_LIMIT_RESET_PASSWORD_EMAIL_PER_EMAIL: reset password emails asked for one email, per hour */
  resetPasswordEmailPerEmail = 3;
  /** RATE_LIMIT_RESET_PASSWORD_EMAIL_PER_IP: reset password emails asked, per client address and per hour */
  resetPasswordEmailPerIp = 10;
}
