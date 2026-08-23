import type { UserRepository } from '../../domain/repository/user.repository';

import { BadRequestException, Logger } from '@nestjs/common';

import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../domain/model/user.model';
import { GetUsersByCriteriaUseCase } from './get-users-by-criteria.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('GetUsersByCriteriaUseCase', () => {
  const userRepository = createMock<UserRepository>();

  let useCase: GetUsersByCriteriaUseCase;
  let currentUser: User;
  let matchingUser: User;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    currentUser = new UserBuilder().withEmail('jean@test.fr').build();
    matchingUser = new UserBuilder().withEmail('paul@test.fr').build();
    userRepository.findAllByCriteria.mockResolvedValue([matchingUser]);

    useCase = new GetUsersByCriteriaUseCase(userRepository);
  });

  it('should reject when the criteria is empty', async () => {
    await expect(useCase.execute({ currentUser: toCurrentUser(currentUser), criteria: '' })).rejects.toThrow(
      BadRequestException,
    );
    expect(userRepository.findAllByCriteria).not.toHaveBeenCalled();
  });

  it('should reject when the criteria is shorter than 2 characters', async () => {
    await expect(useCase.execute({ currentUser: toCurrentUser(currentUser), criteria: ' a ' })).rejects.toThrow(
      BadRequestException,
    );
    expect(userRepository.findAllByCriteria).not.toHaveBeenCalled();
  });

  it('should return users matching the criteria', async () => {
    const { users } = await useCase.execute({ currentUser: toCurrentUser(currentUser), criteria: 'pa' });

    expect(users).toEqual([matchingUser]);
    expect(userRepository.findAllByCriteria).toHaveBeenCalledWith({
      criteria: 'pa',
      ignoreUserId: currentUser.id,
      limit: 10,
    });
  });
});
