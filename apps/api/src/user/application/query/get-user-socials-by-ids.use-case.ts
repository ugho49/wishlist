import type { UserSocialRepository } from '../../domain/repository/user-social.repository';

import { Inject, Injectable } from '@nestjs/common';
import { type UserSocialId } from '@wishlist/common';

import { REPOSITORIES } from '../../../repositories/repositories.constants';
import { UserSocial } from '../../domain/model/user-social.model';

export type GetUserSocialsByIdsInput = {
  userSocialIds: UserSocialId[];
};

@Injectable()
export class GetUserSocialsByIdsUseCase {
  constructor(
    @Inject(REPOSITORIES.USER_SOCIAL)
    private readonly userSocialRepository: UserSocialRepository,
  ) {}

  execute(input: GetUserSocialsByIdsInput): Promise<UserSocial[]> {
    return this.userSocialRepository.findByIds(input.userSocialIds);
  }
}
