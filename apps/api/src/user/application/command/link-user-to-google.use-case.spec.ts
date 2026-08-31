import type { UserAccountId } from '@wishlist/common';
import type { UserRepository } from '../../domain/repository/user.repository';
import type { UserAccountRepository } from '../../domain/repository/user-account.repository';

import { BadRequestException, Logger, UnauthorizedException } from '@nestjs/common';
import { uuid } from '@wishlist/common';

import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { UserAccountBuilder } from '../../../../test-utils/builders/user-account.builder';
import { createMock } from '../../../../test-utils/mocks';
import { GoogleAuthService } from '../../../auth/infrastructure/social/google-auth.service';
import { TransactionManager } from '../../../core/database/transaction-manager';
import { User } from '../../domain/model/user.model';
import { UserAccountProvider } from '../../domain/user-account-provider.enum';
import { LinkUserToGoogleUseCase } from './link-user-to-google.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('LinkUserToGoogleUseCase', () => {
  const userRepository = createMock<UserRepository>();
  const userAccountRepository = createMock<UserAccountRepository>();
  const googleAuthService = createMock<GoogleAuthService>();
  const transactionManager = createMock<TransactionManager>();

  let useCase: LinkUserToGoogleUseCase;
  let user: User;

  const googlePayload = {
    sub: 'google-sub',
    email: 'jean@test.fr',
    email_verified: true,
    name: 'Jean Dupont',
    picture: 'https://google/pic.png',
  };

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    user = new UserBuilder().withEmail('jean@test.fr').build();
    userRepository.findByIdOrFail.mockResolvedValue(user);
    userAccountRepository.findByUserId.mockResolvedValue([]);
    userAccountRepository.findByProviderAccountId.mockResolvedValue(undefined);
    userAccountRepository.newId.mockReturnValue(uuid() as UserAccountId);
    googleAuthService.getGoogleAccountFromCode.mockResolvedValue(googlePayload);
    transactionManager.runInTransaction.mockImplementation(async fn => fn({} as never));

    useCase = new LinkUserToGoogleUseCase(userRepository, userAccountRepository, googleAuthService, transactionManager);
  });

  it('should reject when the user is already linked to Google', async () => {
    userAccountRepository.findByUserId.mockResolvedValueOnce([
      new UserAccountBuilder().withUser(user).withGoogle('existing').build(),
    ]);

    await expect(useCase.execute({ code: 'code', userId: user.id })).rejects.toThrow(BadRequestException);
  });

  it('should reject when the Google account is already linked to another user', async () => {
    userAccountRepository.findByProviderAccountId.mockResolvedValueOnce(
      new UserAccountBuilder()
        .withUser(new UserBuilder().withEmail('other@test.fr').build())
        .withEmail('other@test.fr')
        .withGoogle('google-sub')
        .build(),
    );

    await expect(useCase.execute({ code: 'code', userId: user.id })).rejects.toThrow(BadRequestException);
  });

  it('should reject when the Google email is not verified', async () => {
    googleAuthService.getGoogleAccountFromCode.mockResolvedValueOnce({ ...googlePayload, email_verified: false });

    await expect(useCase.execute({ code: 'code', userId: user.id })).rejects.toThrow(UnauthorizedException);
  });

  it('should reject when Google does not provide an email', async () => {
    googleAuthService.getGoogleAccountFromCode.mockResolvedValueOnce({ ...googlePayload, email: undefined });

    await expect(useCase.execute({ code: 'code', userId: user.id })).rejects.toThrow(BadRequestException);
  });

  it('should link the Google account and copy the picture when the user has none', async () => {
    const { userAccount } = await useCase.execute({ code: 'code', userId: user.id });

    expect(userAccount.provider).toBe(UserAccountProvider.GOOGLE);
    expect(userAccount.providerAccountId).toBe('google-sub');
    expect(userRepository.save).toHaveBeenCalledTimes(1);
    expect(userAccountRepository.save).toHaveBeenCalledTimes(1);
    expect(userRepository.save.mock.calls[0]?.[0]?.pictureUrl).toBe('https://google/pic.png');
  });
});
