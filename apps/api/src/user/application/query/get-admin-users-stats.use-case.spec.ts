import type { UserRepository } from '../../domain/repository/user.repository';

import { DateTime } from 'luxon';

import { createMock } from '../../../../test-utils/mocks';
import { GetAdminUsersStatsUseCase } from './get-admin-users-stats.use-case';
import { beforeEach, describe, expect, it, mock } from 'bun:test';

describe('GetAdminUsersStatsUseCase', () => {
  const userRepository = createMock<UserRepository>();
  let useCase: GetAdminUsersStatsUseCase;

  beforeEach(() => {
    mock.clearAllMocks();
    useCase = new GetAdminUsersStatsUseCase(userRepository);
  });

  it('should return admin user stats with a 12-month creation series', async () => {
    const stats = { totalCount: 12, enabledCount: 10, adminCount: 2 };
    const currentMonth = DateTime.utc().toFormat('yyyy-MM');
    userRepository.countAdminStats.mockResolvedValueOnce(stats);
    userRepository.countCreatedByMonth.mockResolvedValueOnce([{ month: currentMonth, count: 3 }]);

    const result = await useCase.execute();

    expect(result).toMatchObject(stats);
    expect(result.createdByMonth).toHaveLength(12);
    expect(result.createdByMonth.at(-1)).toEqual({ month: currentMonth, count: 3 });
    expect(userRepository.countAdminStats).toHaveBeenCalledTimes(1);
    expect(userRepository.countCreatedByMonth).toHaveBeenCalledTimes(1);
  });
});
