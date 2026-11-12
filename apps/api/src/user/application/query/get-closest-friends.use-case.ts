import type { User } from '../../domain/model/user.model';
import type { UserRepository } from '../../domain/repository/user.repository';

import { type UserId } from '@wishlist/common';
import { Injectable } from '@znight/core';
import { BadRequestException } from '@znight/http';

const MAX_LIMIT = 50;

export type GetClosestFriendsInput = {
  userId: UserId;
  limit: number;
};

export type GetClosestFriendsOutput = {
  users: User[];
};

@Injectable()
export class GetClosestFriendsUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(query: GetClosestFriendsInput): Promise<GetClosestFriendsOutput> {
    const { userId, limit } = query;

    if (limit > MAX_LIMIT) {
      throw new BadRequestException(`Limit cannot be greater than ${MAX_LIMIT}`);
    }

    const closestFriends = await this.userRepository.findClosestFriends(userId, limit);

    return { users: closestFriends };
  }
}
