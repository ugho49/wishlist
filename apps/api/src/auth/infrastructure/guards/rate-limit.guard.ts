import type { GraphQLArgs, GraphQLGuard, ResolverContext } from '@znight/graphql';
import type { RateLimiter } from '../../../core/rate-limit/rate-limiter';

import { Injectable } from '@znight/core';

import { RateLimitConfig } from '../../../core/rate-limit/rate-limit.config';
import { rateLimitRules } from '../../../core/rate-limit/rate-limit.policies';
import { findCurrentUser } from '../auth.context';
import { RateLimit } from '../decorators/rate-limit.decorator';

/**
 * The `input.email` argument of the field (login, reset password email), as the client sent it:
 * the guard runs before the `@Args` validation, so it may be anything.
 */
function emailArgument(args: GraphQLArgs): string | undefined {
  const input: unknown = args.input;
  if (typeof input !== 'object' || input === null || !('email' in input)) return undefined;
  return typeof input.email === 'string' ? input.email : undefined;
}

/**
 * Enforces `@RateLimit(policy)` on GraphQL fields. It runs for every call of the field, so each alias
 * of a request counts, and after the AccessGuard, so a call refused for access never counts. Over
 * the limit, it throws the `RATE_LIMITED` business rule (mapped to a `BusinessRuleRejection`).
 *
 * Limits that depend on the business outcome (a variable cost, only counted once the call is
 * valid) stay in the use cases, with the {@link RateLimiter} directly.
 */
@Injectable()
export class RateLimitGuard implements GraphQLGuard {
  static readonly enforces = [RateLimit];

  constructor(
    private readonly rateLimiter: RateLimiter,
    private readonly rateLimitConfig: RateLimitConfig,
  ) {}

  async canResolve(ctx: ResolverContext): Promise<boolean> {
    const policy = RateLimit.get(ctx);
    if (policy === undefined) return true;

    const rules = rateLimitRules(policy, this.rateLimitConfig, {
      userId: findCurrentUser(ctx.http)?.id,
      ip: ctx.http?.ip,
      email: emailArgument(ctx.args),
    });
    await this.rateLimiter.consume(rules);

    return true;
  }
}
