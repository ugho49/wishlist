import type { EventRepository } from '../../domain/repository/event.repository';

import { Injectable } from '@znight/core';

import { buildMonthlySeries, type MonthlyCount, monthlySeriesStart } from '../../../core/common/monthly-counts';

export type GetAdminEventsStatsOutput = {
  totalCount: number;
  upcomingCount: number;
  pastCount: number;
  createdByMonth: MonthlyCount[];
};

@Injectable()
export class GetAdminEventsStatsUseCase {
  constructor(private readonly eventRepository: EventRepository) {}

  async execute(): Promise<GetAdminEventsStatsOutput> {
    const [stats, createdByMonth] = await Promise.all([
      this.eventRepository.countAdminStats(),
      this.eventRepository.countCreatedByMonth(monthlySeriesStart()),
    ]);

    return {
      ...stats,
      createdByMonth: buildMonthlySeries(createdByMonth),
    };
  }
}
