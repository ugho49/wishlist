import type { RateLimitRule } from './rate-limiter';

import { createHash } from 'node:crypto';

import { FIFTEEN_MINUTES_IN_SECONDS, ONE_HOUR_IN_SECONDS, type RateLimitConfig } from './rate-limit.config';

/** Who a counter belongs to: the authenticated user, the client address, or the email a public call targets. */
export type RateLimitSubject = 'user' | 'ip' | 'email';

export type RateLimitSubjects = { userId?: string; ip?: string; email?: string };

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
  /** Password login: per email against a brute force of one account, per address against a spray of many. */
  login: (config: RateLimitConfig): RateLimitPolicyRule[] => [
    { by: 'email', limit: config.loginPerEmail, windowSeconds: FIFTEEN_MINUTES_IN_SECONDS },
    { by: 'ip', limit: config.loginPerIp, windowSeconds: FIFTEEN_MINUTES_IN_SECONDS },
  ],
  /** Account creation, by sign-up or by a first Google login (one counter for both). */
  signUp: (config: RateLimitConfig): RateLimitPolicyRule[] => [
    { by: 'ip', limit: config.signUpPerIp, windowSeconds: ONE_HOUR_IN_SECONDS },
  ],
  /** Reset password email: sends an email to any address. */
  resetPasswordEmail: (config: RateLimitConfig): RateLimitPolicyRule[] => [
    { by: 'email', limit: config.resetPasswordEmailPerEmail, windowSeconds: ONE_HOUR_IN_SECONDS },
    { by: 'ip', limit: config.resetPasswordEmailPerIp, windowSeconds: ONE_HOUR_IN_SECONDS },
  ],
} satisfies Record<string, (config: RateLimitConfig) => RateLimitPolicyRule[]>;

export type RateLimitPolicyName = keyof typeof POLICIES;

/**
 * An email as a counter subject: lowercased like the Zod schemas do (`Jean@…` and `jean@…` share
 * a counter), then hashed so that the keys hold no address and keep a bounded size whatever the
 * caller sends.
 */
export function emailSubject(email: string): string {
  return createHash('sha256').update(email.trim().toLowerCase()).digest('hex');
}

function subjectOf(by: RateLimitSubject, subjects: RateLimitSubjects): string | undefined {
  switch (by) {
    case 'user':
      return subjects.userId;
    case 'ip':
      return subjects.ip;
    case 'email':
      return subjects.email === undefined ? undefined : emailSubject(subjects.email);
  }
}

/**
 * The counters of a policy for one call. A counter whose subject is unknown (no authenticated user,
 * no client address, no email) is skipped.
 */
export function rateLimitRules(
  policy: RateLimitPolicyName,
  config: RateLimitConfig,
  subjects: RateLimitSubjects,
): RateLimitRule[] {
  return POLICIES[policy](config).flatMap(rule => {
    const subject = subjectOf(rule.by, subjects);
    if (!subject) return [];
    return [{ key: `${policy}:${rule.by}:${subject}`, limit: rule.limit, windowSeconds: rule.windowSeconds }];
  });
}
