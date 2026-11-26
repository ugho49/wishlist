import { RateLimitConfig } from './rate-limit.config';
import { rateLimitRules } from './rate-limit.policies';
import { describe, expect, it } from 'bun:test';

describe('rateLimitRules', () => {
  const config = Object.assign(new RateLimitConfig(), { userByEmailPerUser: 5, userByEmailPerIp: 8 });

  it('should read the limits of the policy from the config, one counter per subject', () => {
    expect(rateLimitRules('userByEmail', config, { userId: 'user-1', ip: '::1' })).toEqual([
      { key: 'userByEmail:user:user-1', limit: 5, windowSeconds: 3600 },
      { key: 'userByEmail:ip:::1', limit: 8, windowSeconds: 3600 },
    ]);
  });

  it('should skip the counters whose subject is unknown', () => {
    expect(rateLimitRules('userByEmail', config, { userId: 'user-1' })).toEqual([
      { key: 'userByEmail:user:user-1', limit: 5, windowSeconds: 3600 },
    ]);
    expect(rateLimitRules('userByEmail', config, {})).toEqual([]);
  });
});
