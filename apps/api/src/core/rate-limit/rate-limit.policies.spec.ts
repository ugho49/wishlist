import { RateLimitConfig } from './rate-limit.config';
import { emailSubject, rateLimitRules } from './rate-limit.policies';
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

  describe('email subject', () => {
    const jeanSubject = emailSubject('jean@test.fr');

    it('should key a counter by the hashed email, never the address itself', () => {
      const rules = rateLimitRules('login', new RateLimitConfig(), { email: 'jean@test.fr', ip: '::1' });

      expect(rules).toEqual([
        { key: `login:email:${jeanSubject}`, limit: 10, windowSeconds: 900 },
        { key: 'login:ip:::1', limit: 30, windowSeconds: 900 },
      ]);
      expect(jeanSubject).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should share the counter of an email whatever its case or surrounding spaces', () => {
      expect(emailSubject(' Jean@TEST.fr ')).toBe(jeanSubject);
      expect(emailSubject('paul@test.fr')).not.toBe(jeanSubject);
    });
  });

  it.each([
    {
      policy: 'login' as const,
      expected: [
        { by: 'email', limit: 10, windowSeconds: 900 },
        { by: 'ip', limit: 30, windowSeconds: 900 },
      ],
    },
    { policy: 'signUp' as const, expected: [{ by: 'ip', limit: 10, windowSeconds: 3600 }] },
    {
      policy: 'resetPasswordEmail' as const,
      expected: [
        { by: 'email', limit: 3, windowSeconds: 3600 },
        { by: 'ip', limit: 10, windowSeconds: 3600 },
      ],
    },
  ])('should apply the default limits of the $policy policy', ({ policy, expected }) => {
    const rules = rateLimitRules(policy, new RateLimitConfig(), { email: 'jean@test.fr', ip: '::1' });

    expect(rules).toEqual(
      expected.map(({ by, limit, windowSeconds }) => ({
        key: `${policy}:${by}:${by === 'email' ? emailSubject('jean@test.fr') : '::1'}`,
        limit,
        windowSeconds,
      })),
    );
  });
});
