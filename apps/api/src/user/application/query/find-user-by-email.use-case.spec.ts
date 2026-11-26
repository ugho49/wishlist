import type { RateLimiter } from '../../../core/rate-limit/rate-limiter';
import type { UserRepository } from '../../domain/repository/user.repository';

import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { BusinessRuleException } from '../../../core/common/business-rule.exception';
import { RateLimitConfig } from '../../../core/rate-limit/rate-limit.config';
import { User } from '../../domain/model/user.model';
import { FindUserByEmailUseCase } from './find-user-by-email.use-case';
import { beforeEach, describe, expect, it, mock } from 'bun:test';

describe('FindUserByEmailUseCase', () => {
  const userRepository = createMock<UserRepository>();
  const rateLimiter = createMock<RateLimiter>();
  const rateLimitConfig = new RateLimitConfig();

  let useCase: FindUserByEmailUseCase;
  let currentUser: User;
  let otherUser: User;

  beforeEach(() => {
    mock.clearAllMocks();

    currentUser = new UserBuilder().withEmail('jean@test.fr').build();
    otherUser = new UserBuilder().withEmail('paul@test.fr').build();
    rateLimiter.consume.mockResolvedValue(undefined);
    userRepository.findByEmail.mockResolvedValue(otherUser);

    useCase = new FindUserByEmailUseCase(userRepository, rateLimiter, rateLimitConfig);
  });

  it('should rate limit the lookups per user and per client address', async () => {
    await useCase.execute({ currentUser: toCurrentUser(currentUser), email: 'paul@test.fr', ip: '1.2.3.4' });

    expect(rateLimiter.consume).toHaveBeenCalledWith([
      {
        key: `user-by-email:user:${currentUser.id}`,
        limit: rateLimitConfig.userByEmailPerUser,
        windowSeconds: 3600,
      },
      { key: 'user-by-email:ip:1.2.3.4', limit: rateLimitConfig.userByEmailPerIp, windowSeconds: 3600 },
    ]);
  });

  it('should only rate limit per user when the client address is unknown', async () => {
    await useCase.execute({ currentUser: toCurrentUser(currentUser), email: 'paul@test.fr' });

    expect(rateLimiter.consume).toHaveBeenCalledWith([
      {
        key: `user-by-email:user:${currentUser.id}`,
        limit: rateLimitConfig.userByEmailPerUser,
        windowSeconds: 3600,
      },
    ]);
  });

  it('should not look the email up when the rate limit is reached', async () => {
    rateLimiter.consume.mockRejectedValueOnce(new BusinessRuleException('RATE_LIMITED', 'Too many requests'));

    await expect(
      useCase.execute({ currentUser: toCurrentUser(currentUser), email: 'paul@test.fr', ip: '1.2.3.4' }),
    ).rejects.toThrow(BusinessRuleException);
    expect(userRepository.findByEmail).not.toHaveBeenCalled();
  });

  it('should return the user owning the email', async () => {
    const { user } = await useCase.execute({ currentUser: toCurrentUser(currentUser), email: 'paul@test.fr' });

    expect(user).toEqual(otherUser);
    expect(userRepository.findByEmail).toHaveBeenCalledWith('paul@test.fr');
  });

  it('should return no user when the email has no account', async () => {
    userRepository.findByEmail.mockResolvedValueOnce(undefined);

    const { user } = await useCase.execute({ currentUser: toCurrentUser(currentUser), email: 'nobody@test.fr' });

    expect(user).toBeUndefined();
  });

  it('should return no user when the account is disabled', async () => {
    userRepository.findByEmail.mockResolvedValueOnce(new UserBuilder().withEmail('off@test.fr').disabled().build());

    const { user } = await useCase.execute({ currentUser: toCurrentUser(currentUser), email: 'off@test.fr' });

    expect(user).toBeUndefined();
  });

  it('should return no user when the email is the one of the current user', async () => {
    userRepository.findByEmail.mockResolvedValueOnce(currentUser);

    const { user } = await useCase.execute({ currentUser: toCurrentUser(currentUser), email: 'jean@test.fr' });

    expect(user).toBeUndefined();
  });
});
