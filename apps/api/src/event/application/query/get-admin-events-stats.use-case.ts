import type { EventRepository } from '../../domain/repository/event.repository';

import { Inject, Injectable } from '@nestjs/common';

import { buildMonthlySeries, type MonthlyCount, monthlySeriesStart } from '../../../core/common/monthly-counts';
import { REPOSITORIES } from '../../../repositories/repositories.constants';

export type GetAdminEventsStatsOutput = {
  totalCount: number;
  upcomingCount: number;
  pastCount: number;
  createdByMonth: MonthlyCount[];
};

@Injectable()
export class GetAdminEventsStatsUseCase {
  constructor(@Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository) {}

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
