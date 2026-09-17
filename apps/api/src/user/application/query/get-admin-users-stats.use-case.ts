import type { UserRepository } from '../../domain/repository/user.repository';

import { Inject, Injectable } from '@nestjs/common';

import { buildMonthlySeries, type MonthlyCount, monthlySeriesStart } from '../../../core/common/monthly-counts';
import { REPOSITORIES } from '../../../repositories/repositories.constants';

export type GetAdminUsersStatsOutput = {
  totalCount: number;
  enabledCount: number;
  adminCount: number;
  createdByMonth: MonthlyCount[];
};

@Injectable()
export class GetAdminUsersStatsUseCase {
  constructor(
    @Inject(REPOSITORIES.USER)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(): Promise<GetAdminUsersStatsOutput> {
    const [stats, createdByMonth] = await Promise.all([
      this.userRepository.countAdminStats(),
      this.userRepository.countCreatedByMonth(monthlySeriesStart()),
    ]);

    return {
      ...stats,
      createdByMonth: buildMonthlySeries(createdByMonth),
    };
  }
}
