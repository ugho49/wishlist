import type { ICurrentUser } from '@wishlist/common';
import type { ResolverContext } from '@znight/graphql';
import type { HttpContext } from '@znight/http';
import type { RateLimiter } from '../../../core/rate-limit/rate-limiter';

import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { BusinessRuleException } from '../../../core/common/business-rule.exception';
import { RateLimitConfig } from '../../../core/rate-limit/rate-limit.config';
import { emailSubject } from '../../../core/rate-limit/rate-limit.policies';
import { setAuthState } from '../auth.context';
import { RateLimitGuard } from './rate-limit.guard';
import { beforeEach, describe, expect, it, mock } from 'bun:test';

describe('RateLimitGuard', () => {
  const rateLimiter = createMock<RateLimiter>();
  const rateLimitConfig = new RateLimitConfig();

  let guard: RateLimitGuard;
  let currentUser: ICurrentUser;

  const contextFor = (params: {
    policy?: string;
    user?: ICurrentUser;
    ip?: string;
    args?: Record<string, unknown>;
  }): ResolverContext => {
    const http = { state: new Map<string, unknown>(), ip: params.ip } as unknown as HttpContext;
    if (params.user) setAuthState(http, { user: params.user });
    return {
      route: { meta: params.policy ? { rateLimit: params.policy } : {}, coordinate: 'Query.userByEmail' },
      http,
      args: params.args ?? {},
    } as unknown as ResolverContext;
  };

  beforeEach(() => {
    mock.clearAllMocks();
    rateLimiter.consume.mockResolvedValue(undefined);

    currentUser = toCurrentUser(new UserBuilder().withEmail('jean@test.fr').build());

    guard = new RateLimitGuard(rateLimiter, rateLimitConfig);
  });

  it('should let a field without @RateLimit through without counting it', async () => {
    expect(await guard.canResolve(contextFor({ user: currentUser, ip: '1.2.3.4' }))).toBe(true);
    expect(rateLimiter.consume).not.toHaveBeenCalled();
  });

  it('should count the call against the counters of the user and of the client address', async () => {
    expect(await guard.canResolve(contextFor({ policy: 'userByEmail', user: currentUser, ip: '1.2.3.4' }))).toBe(true);

    expect(rateLimiter.consume).toHaveBeenCalledWith([
      {
        key: `userByEmail:user:${currentUser.id}`,
        limit: rateLimitConfig.userByEmailPerUser,
        windowSeconds: 3600,
      },
      { key: 'userByEmail:ip:1.2.3.4', limit: rateLimitConfig.userByEmailPerIp, windowSeconds: 3600 },
    ]);
  });

  it('should skip the counters whose subject is unknown', async () => {
    await guard.canResolve(contextFor({ policy: 'userByEmail', ip: '1.2.3.4' }));

    expect(rateLimiter.consume).toHaveBeenCalledWith([
      { key: 'userByEmail:ip:1.2.3.4', limit: rateLimitConfig.userByEmailPerIp, windowSeconds: 3600 },
    ]);
  });

  it('should fail the field with the RATE_LIMITED business rule when a limit is reached', async () => {
    rateLimiter.consume.mockRejectedValueOnce(new BusinessRuleException('RATE_LIMITED', 'Too many requests'));

    await expect(
      guard.canResolve(contextFor({ policy: 'userByEmail', user: currentUser, ip: '1.2.3.4' })),
    ).rejects.toMatchObject({ code: 'RATE_LIMITED' });
  });

  describe('email of the input', () => {
    it('should count a login against the counters of the email it targets and of the client address', async () => {
      await guard.canResolve(
        contextFor({ policy: 'login', ip: '1.2.3.4', args: { input: { email: 'Jean@Test.fr', password: 'x' } } }),
      );

      expect(rateLimiter.consume).toHaveBeenCalledWith([
        {
          key: `login:email:${emailSubject('jean@test.fr')}`,
          limit: rateLimitConfig.loginPerEmail,
          windowSeconds: 900,
        },
        { key: 'login:ip:1.2.3.4', limit: rateLimitConfig.loginPerIp, windowSeconds: 900 },
      ]);
    });

    it.each([
      { case: 'no input', args: {} },
      { case: 'an input that is not an object', args: { input: 'jean@test.fr' } },
      { case: 'an input without email', args: { input: { password: 'x' } } },
      { case: 'an email that is not a string', args: { input: { email: 42 } } },
    ])('should skip the email counter with $case', async ({ args }) => {
      await guard.canResolve(contextFor({ policy: 'login', ip: '1.2.3.4', args }));

      expect(rateLimiter.consume).toHaveBeenCalledWith([
        { key: 'login:ip:1.2.3.4', limit: rateLimitConfig.loginPerIp, windowSeconds: 900 },
      ]);
    });
  });
});
