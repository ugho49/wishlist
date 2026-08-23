import type { UserRepository } from '../../domain/repository/user.repository';

import { Logger } from '@nestjs/common';

import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../domain/model/user.model';
import { UpdateUserUseCase } from './update-user.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('UpdateUserUseCase', () => {
  const userRepository = createMock<UserRepository>();

  let useCase: UpdateUserUseCase;
  let user: User;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    user = new UserBuilder().withEmail('jean@test.fr').withName({ firstName: 'Jean', lastName: 'Dupont' }).build();
    userRepository.findByIdOrFail.mockResolvedValue(user);

    useCase = new UpdateUserUseCase(userRepository);
  });

  it('should update first name, last name and birthday', async () => {
    const birthday = new Date('1990-01-01');

    await useCase.execute({
      userId: user.id,
      updateUser: { firstname: 'Paul', lastname: 'Martin', birthday },
    });

    expect(userRepository.save).toHaveBeenCalledTimes(1);
    const savedUser = userRepository.save.mock.calls[0]?.[0];
    expect(savedUser?.firstName).toBe('Paul');
    expect(savedUser?.lastName).toBe('Martin');
    expect(savedUser?.birthday).toEqual(birthday);
  });
});
