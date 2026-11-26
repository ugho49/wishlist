import type { UserId, UserSessionId } from '@wishlist/common';
import type { TokenPayload } from 'google-auth-library';
import type { RateLimiter } from '../../../core/rate-limit/rate-limiter';
import type { UserRepository } from '../../../user/domain/repository/user.repository';
import type { UserAccountRepository } from '../../../user/domain/repository/user-account.repository';
import type { UserSessionRepository } from '../../../user/domain/repository/user-session.repository';
import type { AuthConfig } from '../../infrastructure/auth.config';
import type { GoogleAuthService } from '../../infrastructure/social/google-auth.service';
import type { TokenService } from '../../infrastructure/token.service';

import { uuid } from '@wishlist/common';
import { EventPublisher } from '@znight/events';
import { BadRequestException, UnauthorizedException } from '@znight/http';

import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { UserAccountBuilder } from '../../../../test-utils/builders/user-account.builder';
import { createMock } from '../../../../test-utils/mocks';
import { BusinessRuleException } from '../../../core/common/business-rule.exception';
import { TransactionManager } from '../../../core/database/transaction-manager';
import { RateLimitConfig } from '../../../core/rate-limit/rate-limit.config';
import { UserCreatedEvent } from '../../../user/domain/event/user-created.event';
import { LoginWithGoogleUseCase } from './login-with-google.use-case';
import { beforeEach, describe, expect, it, mock } from 'bun:test';

describe('LoginWithGoogleUseCase', () => {
  const userRepository = createMock<UserRepository>();
  const userAccountRepository = createMock<UserAccountRepository>();
  const sessionRepository = createMock<UserSessionRepository>();
  const googleAuthService = createMock<GoogleAuthService>();
  const transactionManager = createMock<TransactionManager>();
  const eventBus = createMock<EventPublisher>();
  const tokenService = createMock<TokenService>();
  const rateLimiter = createMock<RateLimiter>();
  const rateLimitConfig = new RateLimitConfig();
  const config = { refreshTokenDuration: '30d' } as AuthConfig;

  let useCase: LoginWithGoogleUseCase;
  let payload: TokenPayload;
  let newUserId: UserId;

  const signUpRule = { key: 'signUp:ip:1.2.3.4', limit: rateLimitConfig.signUpPerIp, windowSeconds: 3600 };

  beforeEach(() => {
    mock.clearAllMocks();

    payload = {
      sub: 'google-123',
      email: 'jean@gmail.com',
      email_verified: true,
      given_name: 'Jean',
      family_name: 'Dupont',
      picture: 'https://picture.test/jean.png',
    } as TokenPayload;
    newUserId = uuid() as UserId;

    googleAuthService.getGoogleAccountFromCode.mockResolvedValue(payload);
    userAccountRepository.findByProviderAccountId.mockResolvedValue(undefined);
    userAccountRepository.newId.mockReturnValue(uuid() as never);
    userRepository.findByEmail.mockResolvedValue(undefined);
    userRepository.newId.mockReturnValue(newUserId);
    sessionRepository.newId.mockReturnValue(uuid() as UserSessionId);
    transactionManager.runInTransaction.mockImplementation(async callback => callback(undefined as never));
    tokenService.sign.mockResolvedValue('token');
    rateLimiter.consume.mockResolvedValue(undefined);

    useCase = new LoginWithGoogleUseCase(
      userRepository,
      userAccountRepository,
      sessionRepository,
      config,
      googleAuthService,
      transactionManager,
      eventBus,
      tokenService,
      rateLimiter,
      rateLimitConfig,
    );
  });

  describe('account creation', () => {
    it('should count the creation on the sign-up counter of the client address, then create the user', async () => {
      const result = await useCase.execute({ code: 'code', createUserIfNotExists: true, ip: '1.2.3.4' });

      expect(rateLimiter.consume).toHaveBeenCalledWith([signUpRule]);
      expect(result).toMatchObject({ accessToken: 'token', newUserCreated: true });
      expect(userRepository.save.mock.calls[0]?.[0]).toMatchObject({ id: newUserId, email: 'jean@gmail.com' });
      expect(userAccountRepository.save).toHaveBeenCalledTimes(1);
      expect(eventBus.publish.mock.calls[0]?.[0]).toBeInstanceOf(UserCreatedEvent);
    });

    it('should not create the user when the sign-up limit of the client address is reached', async () => {
      rateLimiter.consume.mockRejectedValueOnce(new BusinessRuleException('RATE_LIMITED', 'Too many requests'));

      await expect(useCase.execute({ code: 'code', createUserIfNotExists: true, ip: '1.2.3.4' })).rejects.toMatchObject(
        { code: 'RATE_LIMITED' },
      );
      expect(userRepository.save).not.toHaveBeenCalled();
      expect(userAccountRepository.save).not.toHaveBeenCalled();
      expect(eventBus.publish).not.toHaveBeenCalled();
      expect(sessionRepository.save).not.toHaveBeenCalled();
    });

    it('should not count anything without a client address', async () => {
      await useCase.execute({ code: 'code', createUserIfNotExists: true });

      expect(rateLimiter.consume).toHaveBeenCalledWith([]);
      expect(userRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should not count a creation refused because Google gives no family name', async () => {
      googleAuthService.getGoogleAccountFromCode.mockResolvedValueOnce({ ...payload, family_name: undefined });

      await expect(useCase.execute({ code: 'code', createUserIfNotExists: true, ip: '1.2.3.4' })).rejects.toThrow(
        BadRequestException,
      );
      expect(rateLimiter.consume).not.toHaveBeenCalled();
    });

    it('should refuse an unknown Google account when the caller does not want to create one', async () => {
      await expect(useCase.execute({ code: 'code', createUserIfNotExists: false, ip: '1.2.3.4' })).rejects.toThrow(
        UnauthorizedException,
      );
      expect(rateLimiter.consume).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('existing account', () => {
    it('should log in a known Google account without counting a sign-up', async () => {
      const user = new UserBuilder().withEmail('jean@gmail.com').build();
      userAccountRepository.findByProviderAccountId.mockResolvedValueOnce(
        new UserAccountBuilder().withGoogle('google-123').build(user),
      );
      userRepository.findByIdOrFail.mockResolvedValueOnce(user);

      const result = await useCase.execute({ code: 'code', createUserIfNotExists: true, ip: '1.2.3.4' });

      expect(result.accessToken).toBe('token');
      expect(rateLimiter.consume).not.toHaveBeenCalled();
      expect(userRepository.newId).not.toHaveBeenCalled();
    });

    it('should link Google to the account of the same email without counting a sign-up', async () => {
      userRepository.findByEmail.mockResolvedValueOnce(new UserBuilder().withEmail('jean@gmail.com').build());

      const result = await useCase.execute({ code: 'code', createUserIfNotExists: true, ip: '1.2.3.4' });

      expect(result).toMatchObject({ accessToken: 'token', linkedToExistingUser: true });
      expect(rateLimiter.consume).not.toHaveBeenCalled();
      expect(userAccountRepository.save).toHaveBeenCalledTimes(1);
    });
  });
});
