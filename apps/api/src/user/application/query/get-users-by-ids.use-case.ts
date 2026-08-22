import type { UserRepository } from '../../domain/repository/user.repository';

import { Inject, Injectable } from '@nestjs/common';
import { type UserId } from '@wishlist/common';

import { REPOSITORIES } from '../../../repositories/repositories.constants';
import { User } from '../../domain/model/user.model';

export type GetUsersByIdsInput = {
  userIds: UserId[];
};

@Injectable()
export class GetUsersByIdsUseCase {
  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
  ) {}

  execute(query: GetUsersByIdsInput): Promise<User[]> {
    return this.userRepository.findByIds(query.userIds);
  }
}
