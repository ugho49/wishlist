import type { UserRepository } from '../../domain/repository/user.repository';
import type { UserSocialRepository } from '../../domain/repository/user-social.repository';

import { Inject, Injectable } from '@nestjs/common';
import { UserDto, type UserId } from '@wishlist/common';

import { REPOSITORIES } from '../../../repositories/repositories.constants';
import { userMapper } from '../../infrastructure/user.mapper';

export type GetUserByIdInput = {
  userId: UserId;
};

@Injectable()
export class GetUserByIdUseCase {
  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
    @Inject(REPOSITORIES.USER_SOCIAL)
    private readonly userSocialRepository: UserSocialRepository,
  ) {}

  async execute(query: GetUserByIdInput): Promise<UserDto> {
    const user = await this.userRepository.findByIdOrFail(query.userId);
    const socials = await this.userSocialRepository.findByUserId(query.userId);

    return userMapper.toUserDto({ user, socials });
  }
}
