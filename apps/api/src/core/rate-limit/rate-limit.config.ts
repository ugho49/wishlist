import { Config } from '@znight/config';

export const ONE_HOUR_IN_SECONDS = 60 * 60;
export const ONE_DAY_IN_SECONDS = 24 * ONE_HOUR_IN_SECONDS;

/** Limits of the operations that reveal who has an account or send emails to any address. */
@Config('rateLimit')
export class RateLimitConfig {
  /** RATE_LIMIT_USER_BY_EMAIL_PER_USER: account lookups by exact email, per user and per hour */
  userByEmailPerUser = 30;
  /** RATE_LIMIT_USER_BY_EMAIL_PER_IP: account lookups by exact email, per client address and per hour */
  userByEmailPerIp = 60;
  /** RATE_LIMIT_INVITATIONS_PER_USER: event attendees invited, per user and per day */
  invitationsPerUser = 100;
}
