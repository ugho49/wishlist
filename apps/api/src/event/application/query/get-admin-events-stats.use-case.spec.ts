import type { EventRepository } from '../../domain/repository/event.repository';

import { DateTime } from 'luxon';

import { createMock } from '../../../../test-utils/mocks';
import { GetAdminEventsStatsUseCase } from './get-admin-events-stats.use-case';
import { beforeEach, describe, expect, it, mock } from 'bun:test';

describe('GetAdminEventsStatsUseCase', () => {
  const eventRepository = createMock<EventRepository>();
  let useCase: GetAdminEventsStatsUseCase;

  beforeEach(() => {
    mock.clearAllMocks();
    useCase = new GetAdminEventsStatsUseCase(eventRepository);
  });

  it('should return admin event stats with a 12-month creation series', async () => {
    const stats = { totalCount: 8, upcomingCount: 5, pastCount: 3 };
    const currentMonth = DateTime.utc().toFormat('yyyy-MM');
    eventRepository.countAdminStats.mockResolvedValueOnce(stats);
    eventRepository.countCreatedByMonth.mockResolvedValueOnce([{ month: currentMonth, count: 2 }]);

    const result = await useCase.execute();

    expect(result).toMatchObject(stats);
    expect(result.createdByMonth).toHaveLength(12);
    expect(result.createdByMonth.at(-1)).toEqual({ month: currentMonth, count: 2 });
    expect(eventRepository.countAdminStats).toHaveBeenCalledTimes(1);
    expect(eventRepository.countCreatedByMonth).toHaveBeenCalledTimes(1);
  });
});
