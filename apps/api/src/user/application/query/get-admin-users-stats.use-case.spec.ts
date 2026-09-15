import type { UserRepository } from '../../domain/repository/user.repository';

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

  it('should return admin user stats from the repository', async () => {
    const stats = { totalCount: 12, enabledCount: 10, adminCount: 2 };
    userRepository.countAdminStats.mockResolvedValueOnce(stats);

    await expect(useCase.execute()).resolves.toEqual(stats);
    expect(userRepository.countAdminStats).toHaveBeenCalledTimes(1);
  });
});
