import type { UserSocialId } from '@wishlist/common';
import type { UserRepository } from '../../domain/repository/user.repository';
import type { UserSocialRepository } from '../../domain/repository/user-social.repository';

import { Logger, NotFoundException } from '@nestjs/common';
import { uuid } from '@wishlist/common';

import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { BucketService } from '../../../core/bucket/bucket.service';
import { User } from '../../domain/model/user.model';
import { UserSocial } from '../../domain/model/user-social.model';
import { UserSocialType } from '../../domain/user-social-type.enum';
import { UpdateUserPictureFromSocialUseCase } from './update-user-picture-from-social.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('UpdateUserPictureFromSocialUseCase', () => {
  const userRepository = createMock<UserRepository>();
  const userSocialRepository = createMock<UserSocialRepository>();
  const bucketService = createMock<BucketService>();

  let useCase: UpdateUserPictureFromSocialUseCase;
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
      pictureUrl: 'https://google/pic.png',
    });
    userRepository.findByIdOrFail.mockResolvedValue(user);
    userSocialRepository.findByUserId.mockResolvedValue([social]);

    useCase = new UpdateUserPictureFromSocialUseCase(userRepository, userSocialRepository, bucketService);
  });

  it('should reject when the social id does not exist', async () => {
    await expect(useCase.execute({ userId: user.id, socialId: uuid() as UserSocialId })).rejects.toThrow(
      NotFoundException,
    );
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('should copy the social picture onto the user', async () => {
    await useCase.execute({ userId: user.id, socialId: social.id });

    expect(bucketService.removeIfExist).not.toHaveBeenCalled();
    expect(userRepository.save.mock.calls[0]?.[0]?.pictureUrl).toBe('https://google/pic.png');
  });

  it('should remove the existing picture from the bucket when the user already has one', async () => {
    const userWithPicture = user.updatePicture('https://cdn/old.png');
    userRepository.findByIdOrFail.mockResolvedValueOnce(userWithPicture);

    await useCase.execute({ userId: userWithPicture.id, socialId: social.id });

    expect(bucketService.removeIfExist).toHaveBeenCalledTimes(2);
    expect(userRepository.save).toHaveBeenCalledTimes(1);
  });
});
