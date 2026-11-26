import type { RateLimitRule } from './rate-limiter';

import { ONE_HOUR_IN_SECONDS, type RateLimitConfig } from './rate-limit.config';

/** Who a counter belongs to: the authenticated user, or the client address. */
export type RateLimitSubject = 'user' | 'ip';

type RateLimitPolicyRule = {
  by: RateLimitSubject;
  limit: number;
  windowSeconds: number;
};

/**
 * The policies `@RateLimit(name)` refers to. The limits are read from {@link RateLimitConfig} at
 * runtime, so that the environment can tune them (decorator arguments are static).
 */
const POLICIES = {
  /** Lookup of an account by its exact email: tells whether an email has an account, and whose. */
  userByEmail: (config: RateLimitConfig): RateLimitPolicyRule[] => [
    { by: 'user', limit: config.userByEmailPerUser, windowSeconds: ONE_HOUR_IN_SECONDS },
    { by: 'ip', limit: config.userByEmailPerIp, windowSeconds: ONE_HOUR_IN_SECONDS },
  ],
} satisfies Record<string, (config: RateLimitConfig) => RateLimitPolicyRule[]>;

export type RateLimitPolicyName = keyof typeof POLICIES;

/**
 * The counters of a policy for one call. A counter whose subject is unknown (no authenticated user,
 * no client address) is skipped.
 */
export function rateLimitRules(
  policy: RateLimitPolicyName,
  config: RateLimitConfig,
  subjects: { userId?: string; ip?: string },
): RateLimitRule[] {
  return POLICIES[policy](config).flatMap(rule => {
    const subject = rule.by === 'user' ? subjects.userId : subjects.ip;
    if (!subject) return [];
    return [{ key: `${policy}:${rule.by}:${subject}`, limit: rule.limit, windowSeconds: rule.windowSeconds }];
  });
}
