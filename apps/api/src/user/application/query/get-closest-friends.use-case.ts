import type { User } from '../../domain/model/user.model';
import type { UserRepository } from '../../domain/repository/user.repository';

import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { type UserId } from '@wishlist/common';

import { REPOSITORIES } from '../../../repositories/repositories.constants';

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
  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(query: GetClosestFriendsInput): Promise<GetClosestFriendsOutput> {
    const { userId, limit } = query;

    if (limit > MAX_LIMIT) {
      throw new BadRequestException(`Limit cannot be greater than ${MAX_LIMIT}`);
    }

    const closestFriends = await this.userRepository.findClosestFriends(userId, limit);

    return { users: closestFriends };
  }
}
