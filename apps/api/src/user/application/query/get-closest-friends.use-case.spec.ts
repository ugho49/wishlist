import type { UserRepository } from '../../domain/repository/user.repository';

import { BadRequestException, Logger } from '@nestjs/common';

import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../domain/model/user.model';
import { GetClosestFriendsUseCase } from './get-closest-friends.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('GetClosestFriendsUseCase', () => {
  const userRepository = createMock<UserRepository>();

  let useCase: GetClosestFriendsUseCase;
  let user: User;
  let friend: User;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    user = new UserBuilder().withEmail('jean@test.fr').build();
    friend = new UserBuilder().withEmail('paul@test.fr').build();
    userRepository.findClosestFriends.mockResolvedValue([friend]);

    useCase = new GetClosestFriendsUseCase(userRepository);
  });

  it('should reject when the limit is greater than 50', async () => {
    await expect(useCase.execute({ userId: user.id, limit: 51 })).rejects.toThrow(BadRequestException);
    expect(userRepository.findClosestFriends).not.toHaveBeenCalled();
  });

  it('should return the closest friends', async () => {
    const { users } = await useCase.execute({ userId: user.id, limit: 10 });

    expect(users).toEqual([friend]);
    expect(userRepository.findClosestFriends).toHaveBeenCalledWith(user.id, 10);
  });
});
