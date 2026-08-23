import type { UserRepository } from '../../domain/repository/user.repository';

import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { GetUsersByIdsUseCase } from './get-users-by-ids.use-case';
import { beforeEach, describe, expect, it, mock } from 'bun:test';

describe('GetUsersByIdsUseCase', () => {
  const userRepository = createMock<UserRepository>();
  let useCase: GetUsersByIdsUseCase;

  beforeEach(() => {
    mock.clearAllMocks();
    useCase = new GetUsersByIdsUseCase(userRepository);
  });

  it('should return users matching the given ids', async () => {
    const users = [new UserBuilder().build(), new UserBuilder().build()];
    userRepository.findByIds.mockResolvedValueOnce(users);

    const result = await useCase.execute({ userIds: users.map(user => user.id) });

    expect(result).toEqual(users);
    expect(userRepository.findByIds).toHaveBeenCalledWith(users.map(user => user.id));
  });
});
