import type { UserRepository } from '../../domain/repository/user.repository';

import { type UserId } from '@wishlist/common';
import { Injectable } from '@znight/core';

import { User } from '../../domain/model/user.model';

export type GetUsersByIdsInput = {
  userIds: UserId[];
};

@Injectable()
export class GetUsersByIdsUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  execute(query: GetUsersByIdsInput): Promise<User[]> {
    return this.userRepository.findByIds(query.userIds);
  }
}
