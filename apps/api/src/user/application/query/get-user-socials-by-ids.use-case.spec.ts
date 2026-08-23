import type { UserSocialId } from '@wishlist/common';
import type { UserSocialRepository } from '../../domain/repository/user-social.repository';

import { uuid } from '@wishlist/common';

import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { UserSocial } from '../../domain/model/user-social.model';
import { UserSocialType } from '../../domain/user-social-type.enum';
import { GetUserSocialsByIdsUseCase } from './get-user-socials-by-ids.use-case';
import { beforeEach, describe, expect, it, mock } from 'bun:test';

describe('GetUserSocialsByIdsUseCase', () => {
  const userSocialRepository = createMock<UserSocialRepository>();
  let useCase: GetUserSocialsByIdsUseCase;

  beforeEach(() => {
    mock.clearAllMocks();
    useCase = new GetUserSocialsByIdsUseCase(userSocialRepository);
  });

  it('should return socials matching the given ids', async () => {
    const user = new UserBuilder().build();
    const social = UserSocial.create({
      id: uuid() as UserSocialId,
      user,
      email: user.email,
      socialId: 'google-1',
      socialType: UserSocialType.GOOGLE,
    });
    userSocialRepository.findByIds.mockResolvedValueOnce([social]);

    const result = await useCase.execute({ userSocialIds: [social.id] });

    expect(result).toEqual([social]);
  });
});
