import type { UserSocialId } from '@wishlist/common';
import type { UserRepository } from '../../domain/repository/user.repository';
import type { UserSocialRepository } from '../../domain/repository/user-social.repository';

import { BadRequestException, Logger, UnauthorizedException } from '@nestjs/common';
import { uuid } from '@wishlist/common';

import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { GoogleAuthService } from '../../../auth/infrastructure/social/google-auth.service';
import { TransactionManager } from '../../../core/database/transaction-manager';
import { User } from '../../domain/model/user.model';
import { UserSocial } from '../../domain/model/user-social.model';
import { UserSocialType } from '../../domain/user-social-type.enum';
import { LinkUserToGoogleUseCase } from './link-user-to-google.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('LinkUserToGoogleUseCase', () => {
  const userRepository = createMock<UserRepository>();
  const userSocialRepository = createMock<UserSocialRepository>();
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
    userSocialRepository.findByUserId.mockResolvedValue([]);
    userSocialRepository.findBySocialId.mockResolvedValue(undefined);
    userSocialRepository.newId.mockReturnValue(uuid() as UserSocialId);
    googleAuthService.getGoogleAccountFromCode.mockResolvedValue(googlePayload);
    transactionManager.runInTransaction.mockImplementation(async fn => fn({} as never));

    useCase = new LinkUserToGoogleUseCase(userRepository, userSocialRepository, googleAuthService, transactionManager);
  });

  it('should reject when the user is already linked to Google', async () => {
    userSocialRepository.findByUserId.mockResolvedValueOnce([
      UserSocial.create({
        id: uuid() as UserSocialId,
        user,
        email: user.email,
        socialId: 'existing',
        socialType: UserSocialType.GOOGLE,
      }),
    ]);

    await expect(useCase.execute({ code: 'code', userId: user.id })).rejects.toThrow(BadRequestException);
  });

  it('should reject when the Google account is already linked to another user', async () => {
    userSocialRepository.findBySocialId.mockResolvedValueOnce(
      UserSocial.create({
        id: uuid() as UserSocialId,
        user: new UserBuilder().withEmail('other@test.fr').build(),
        email: 'other@test.fr',
        socialId: 'google-sub',
        socialType: UserSocialType.GOOGLE,
      }),
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
    const { userSocial } = await useCase.execute({ code: 'code', userId: user.id });

    expect(userSocial.socialType).toBe(UserSocialType.GOOGLE);
    expect(userSocial.socialId).toBe('google-sub');
    expect(userRepository.save).toHaveBeenCalledTimes(1);
    expect(userSocialRepository.save).toHaveBeenCalledTimes(1);
    expect(userRepository.save.mock.calls[0]?.[0]?.pictureUrl).toBe('https://google/pic.png');
  });
});
