import type { RateLimiter, RateLimitRule } from './rate-limiter';

import { Injectable, type OnStop } from '@znight/core';
import Redis from 'ioredis';

import { BusinessRuleException } from '../common/business-rule.exception';
import { QueueConfig } from '../queue/queue.config';

export const RATE_LIMIT_KEY_PREFIX = 'rl:';

/**
 * Checks every counter first and only then increments them all, so that a rejected call costs
 * nothing (a rejected 50-invitation event does not eat the quota of the next smaller one).
 *
 * KEYS: the counters. ARGV: the cost, then the limit and the window (seconds) of each counter.
 * Returns 0 when the hits are counted, otherwise the 1-based index of the counter over its limit.
 */
const CONSUME_SCRIPT = `
local cost = tonumber(ARGV[1])
for i, key in ipairs(KEYS) do
  local limit = tonumber(ARGV[i * 2])
  local current = tonumber(redis.call('GET', key) or '0')
  if current + cost > limit then
    return i
  end
end
for i, key in ipairs(KEYS) do
  local window = tonumber(ARGV[i * 2 + 1])
  redis.call('INCRBY', key, cost)
  if redis.call('TTL', key) < 0 then
    redis.call('EXPIRE', key, window)
  end
end
return 0
`;

/** Fixed-window counters in Valkey, shared by every API instance. */
@Injectable()
export class ValkeyRateLimiter implements RateLimiter, OnStop {
  private readonly connection: Redis;

  constructor(config: QueueConfig) {
    this.connection = new Redis({
      host: config.host,
      port: config.port,
      password: config.password || undefined,
      db: config.db,
      // Fail fast: a request must not hang while Valkey is unreachable
      maxRetriesPerRequest: 1,
    });
  }

  async consume(rules: RateLimitRule[], cost = 1): Promise<void> {
    if (rules.length === 0 || cost <= 0) return;

    const keys = rules.map(rule => `${RATE_LIMIT_KEY_PREFIX}${rule.key}`);
    const args = [cost, ...rules.flatMap(rule => [rule.limit, rule.windowSeconds])];

    const rejectedRule = await this.connection.eval(CONSUME_SCRIPT, keys.length, ...keys, ...args);

    if (rejectedRule !== 0) {
      throw new BusinessRuleException('RATE_LIMITED', 'Too many requests, please try again later');
    }
  }

  async onStop() {
    await this.connection.quit();
  }

  /** Also runs when the application failed to start (onStop did not run). */
  [Symbol.dispose]() {
    this.connection.disconnect();
  }
}
