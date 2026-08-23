import type { UserSocialId } from '@wishlist/common';
import type { UserSocialRepository } from '../../domain/repository/user-social.repository';

import { Logger, NotFoundException } from '@nestjs/common';
import { uuid } from '@wishlist/common';

import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../domain/model/user.model';
import { UserSocial } from '../../domain/model/user-social.model';
import { UserSocialType } from '../../domain/user-social-type.enum';
import { UnlinkUserSocialUseCase } from './unlink-user-social.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('UnlinkUserSocialUseCase', () => {
  const userSocialRepository = createMock<UserSocialRepository>();

  let useCase: UnlinkUserSocialUseCase;
  let user: User;
  let social: UserSocial;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    user = new UserBuilder().withEmail('jean@test.fr').build();
    social = UserSocial.create({
      id: uuid() as UserSocialId,
      user,
      email: user.email,
      socialId: 'google-123',
      socialType: UserSocialType.GOOGLE,
    });
    userSocialRepository.findByUserId.mockResolvedValue([social]);

    useCase = new UnlinkUserSocialUseCase(userSocialRepository);
  });

  it('should reject when the social id does not exist', async () => {
    await expect(useCase.execute({ userId: user.id, socialId: uuid() as UserSocialId })).rejects.toThrow(
      NotFoundException,
    );
    expect(userSocialRepository.delete).not.toHaveBeenCalled();
  });

  it('should delete the social account', async () => {
    await useCase.execute({ userId: user.id, socialId: social.id });

    expect(userSocialRepository.delete).toHaveBeenCalledWith(social.id);
  });
});
