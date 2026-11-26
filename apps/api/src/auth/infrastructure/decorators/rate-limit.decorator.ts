import type { RateLimitPolicyName } from '../../../core/rate-limit/rate-limit.policies';

import { createRouteDecorator } from '@znight/http';

/**
 * Rate limits a GraphQL field with a named policy (see rate-limit.policies.ts): every call counts,
 * aliases included. Enforced by the {@link RateLimitGuard}; a call over the limit answers the
 * `RATE_LIMITED` business rule, so the field's result union must hold `BusinessRuleRejection`.
 *
 * ```ts
 * @Query()
 * @RateLimit('userByEmail')
 * async userByEmail(...) {}
 * ```
 */
export const RateLimit = createRouteDecorator<RateLimitPolicyName>('rateLimit');
