import type { UserRepository } from '../../domain/repository/user.repository';

import { Injectable } from '@znight/core';

import { buildMonthlySeries, type MonthlyCount, monthlySeriesStart } from '../../../core/common/monthly-counts';

export type GetAdminUsersStatsOutput = {
  totalCount: number;
  enabledCount: number;
  adminCount: number;
  createdByMonth: MonthlyCount[];
};

@Injectable()
export class GetAdminUsersStatsUseCase {
  constructor(private readonly userRepository: UserRepository) {}

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
