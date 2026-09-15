import type { EventRepository } from '../../domain/repository/event.repository';

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

  it('should return admin event stats from the repository', async () => {
    const stats = { totalCount: 8, upcomingCount: 5, pastCount: 3 };
    eventRepository.countAdminStats.mockResolvedValueOnce(stats);

    await expect(useCase.execute()).resolves.toEqual(stats);
    expect(eventRepository.countAdminStats).toHaveBeenCalledTimes(1);
  });
});
