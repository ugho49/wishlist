import type { User } from '../../domain/model/user.model';
import type { UserRepository } from '../../domain/repository/user.repository';

import { type ICurrentUser } from '@wishlist/common';
import { Injectable } from '@znight/core';
import { BadRequestException } from '@znight/http';

const MIN_KEYWORD_LENGTH = 2;
const MAX_RESULTS = 10;

export type SearchUsersInCircleInput = {
  currentUser: ICurrentUser;
  keyword: string;
};

export type SearchUsersInCircleOutput = {
  users: User[];
};

/**
 * Searches the users the current user already attends an event with. Other accounts are only
 * reachable by their exact email (FindUserByEmailUseCase), so the user base cannot be listed.
 */
@Injectable()
export class SearchUsersInCircleUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: SearchUsersInCircleInput): Promise<SearchUsersInCircleOutput> {
    const keyword = input.keyword.trim();

    if (keyword.length < MIN_KEYWORD_LENGTH) {
      throw new BadRequestException('Invalid search keyword');
    }

    const users = await this.userRepository.searchInCircle({
      userId: input.currentUser.id,
      keyword,
      limit: MAX_RESULTS,
    });

    return { users };
  }
}
