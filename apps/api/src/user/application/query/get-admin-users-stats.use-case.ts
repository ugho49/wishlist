import type { UserRepository } from '../../domain/repository/user.repository';

import { Inject, Injectable } from '@nestjs/common';

import { REPOSITORIES } from '../../../repositories/repositories.constants';

export type GetAdminUsersStatsOutput = {
  totalCount: number;
  enabledCount: number;
  adminCount: number;
};

@Injectable()
export class GetAdminUsersStatsUseCase {
  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
  ) {}

  execute(): Promise<GetAdminUsersStatsOutput> {
    return this.userRepository.countAdminStats();
  }
}
