import type { UserRepository } from '../../domain/repository/user.repository';

import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { MiniUserDto, type UserId } from '@wishlist/common';

import { REPOSITORIES } from '../../../repositories/repositories.constants';
import { userMapper } from '../../infrastructure/user.mapper';

const MAX_LIMIT = 50;

export type GetClosestFriendsInput = {
  userId: UserId;
  limit: number;
};

@Injectable()
export class GetClosestFriendsUseCase {
  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(query: GetClosestFriendsInput): Promise<MiniUserDto[]> {
    const { userId, limit } = query;

    if (limit > MAX_LIMIT) {
      throw new BadRequestException(`Limit cannot be greater than ${MAX_LIMIT}`);
    }

    const closestFriends = await this.userRepository.findClosestFriends(userId, limit);

    return closestFriends.map(user => userMapper.toMiniUserDto(user));
  }
}
