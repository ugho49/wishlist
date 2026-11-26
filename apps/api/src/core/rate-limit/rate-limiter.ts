/** A counter shared by every API instance: at most `limit` hits per fixed window of `windowSeconds`. */
export type RateLimitRule = {
  /** Counter key, without the `rl:` prefix (`user-by-email:user:<id>`). */
  key: string;
  limit: number;
  windowSeconds: number;
};

export interface RateLimiter {
  /**
   * Counts `cost` hits (default 1) on every rule, or none at all when one of them would go over its
   * limit: then it throws a `BusinessRuleException` with the `RATE_LIMITED` code.
   */
  consume(rules: RateLimitRule[], cost?: number): Promise<void>;
}
