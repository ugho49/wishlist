import type { UserSocialId } from '@wishlist/common';
import type { UserSocialRepository } from '../../domain/repository/user-social.repository';

import { uuid } from '@wishlist/common';

import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { UserSocial } from '../../domain/model/user-social.model';
import { UserSocialType } from '../../domain/user-social-type.enum';
import { GetUserSocialsByUserIdsUseCase } from './get-user-socials-by-user-ids.use-case';
import { beforeEach, describe, expect, it, mock } from 'bun:test';

describe('GetUserSocialsByUserIdsUseCase', () => {
  const userSocialRepository = createMock<UserSocialRepository>();
  let useCase: GetUserSocialsByUserIdsUseCase;

  beforeEach(() => {
    mock.clearAllMocks();
    useCase = new GetUserSocialsByUserIdsUseCase(userSocialRepository);
  });

  it('should group socials by user id', async () => {
    const user = new UserBuilder().build();
    const social = UserSocial.create({
      id: uuid() as UserSocialId,
      user,
      email: user.email,
      socialId: 'google-1',
      socialType: UserSocialType.GOOGLE,
    });
    userSocialRepository.findByUserIds.mockResolvedValueOnce([social]);

    const result = await useCase.execute({ userIds: [user.id] });

    expect(result.get(user.id)).toEqual([social]);
  });
});
