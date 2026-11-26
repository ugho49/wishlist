import type { UserRepository } from '../../domain/repository/user.repository';

import { BadRequestException } from '@znight/http';

import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../domain/model/user.model';
import { SearchUsersInCircleUseCase } from './search-users-in-circle.use-case';
import { beforeEach, describe, expect, it, mock } from 'bun:test';

describe('SearchUsersInCircleUseCase', () => {
  const userRepository = createMock<UserRepository>();

  let useCase: SearchUsersInCircleUseCase;
  let currentUser: User;
  let matchingUser: User;

  beforeEach(() => {
    mock.clearAllMocks();

    currentUser = new UserBuilder().withEmail('jean@test.fr').build();
    matchingUser = new UserBuilder().withEmail('paul@test.fr').build();
    userRepository.searchInCircle.mockResolvedValue([matchingUser]);

    useCase = new SearchUsersInCircleUseCase(userRepository);
  });

  it('should reject when the keyword is empty', async () => {
    await expect(useCase.execute({ currentUser: toCurrentUser(currentUser), keyword: '' })).rejects.toThrow(
      BadRequestException,
    );
    expect(userRepository.searchInCircle).not.toHaveBeenCalled();
  });

  it('should reject when the keyword is shorter than 2 characters once trimmed', async () => {
    await expect(useCase.execute({ currentUser: toCurrentUser(currentUser), keyword: ' a ' })).rejects.toThrow(
      BadRequestException,
    );
    expect(userRepository.searchInCircle).not.toHaveBeenCalled();
  });

  it('should search the trimmed keyword in the circle of the current user', async () => {
    const { users } = await useCase.execute({ currentUser: toCurrentUser(currentUser), keyword: ' pa ' });

    expect(users).toEqual([matchingUser]);
    expect(userRepository.searchInCircle).toHaveBeenCalledWith({
      userId: currentUser.id,
      keyword: 'pa',
      limit: 10,
    });
  });
});
