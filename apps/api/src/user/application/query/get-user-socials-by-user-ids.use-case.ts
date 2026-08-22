import type { UserSocialRepository } from '../../domain/repository/user-social.repository';

import { Inject, Injectable } from '@nestjs/common';
import { type UserId } from '@wishlist/common';

import { REPOSITORIES } from '../../../repositories/repositories.constants';
import { UserSocial } from '../../domain/model/user-social.model';

export type GetUserSocialsByUserIdsInput = {
  userIds: UserId[];
};

@Injectable()
export class GetUserSocialsByUserIdsUseCase {
  constructor(
    @Inject(REPOSITORIES.USER_SOCIAL)
    private readonly userSocialRepository: UserSocialRepository,
  ) {}

  async execute(query: GetUserSocialsByUserIdsInput): Promise<Map<UserId, UserSocial[]>> {
    const userSocials = await this.userSocialRepository.findByUserIds(query.userIds);

    return userSocials.reduce((acc, userSocial) => {
      if (!acc.has(userSocial.user.id)) {
        acc.set(userSocial.user.id, []);
      }
      acc.get(userSocial.user.id)?.push(userSocial);
      return acc;
    }, new Map<UserId, UserSocial[]>());
  }
}
