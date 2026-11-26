import type { UserId } from '@wishlist/common';
import type { RateLimitRule } from '../../core/rate-limit/rate-limiter';

import { ONE_DAY_IN_SECONDS, type RateLimitConfig } from '../../core/rate-limit/rate-limit.config';

/**
 * Inviting an attendee tells whether the email has an account (the response carries the user) and
 * sends an email to any address: every invitation counts against a daily quota of the inviter.
 */
export function invitationRateLimitRule(userId: UserId, config: RateLimitConfig): RateLimitRule {
  return {
    key: `invitation:user:${userId}`,
    limit: config.invitationsPerUser,
    windowSeconds: ONE_DAY_IN_SECONDS,
  };
}
