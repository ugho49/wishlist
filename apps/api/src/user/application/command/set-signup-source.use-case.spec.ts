import type { UserRepository } from '../../domain/repository/user.repository';

import { Logger } from '@nestjs/common';

import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../domain/model/user.model';
import { SignupSource } from '../../domain/signup-source.enum';
import { SetSignupSourceUseCase } from './set-signup-source.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('SetSignupSourceUseCase', () => {
  const userRepository = createMock<UserRepository>();

  let useCase: SetSignupSourceUseCase;
  let user: User;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    user = new UserBuilder().withEmail('jean@test.fr').build();
    userRepository.findByIdOrFail.mockResolvedValue(user);

    useCase = new SetSignupSourceUseCase(userRepository);
  });

  it('should save the signup source', async () => {
    await useCase.execute({ userId: user.id, source: SignupSource.GOOGLE });

    expect(userRepository.save).toHaveBeenCalledTimes(1);
    const savedUser = userRepository.save.mock.calls[0]?.[0];
    expect(savedUser?.signupSource).toBe(SignupSource.GOOGLE);
    expect(savedUser?.signupSourceDetail).toBeUndefined();
  });

  it('should keep the free-text detail only for other', async () => {
    await useCase.execute({ userId: user.id, source: SignupSource.OTHER, detail: 'podcast' });

    const savedUser = userRepository.save.mock.calls[0]?.[0];
    expect(savedUser?.signupSource).toBe(SignupSource.OTHER);
    expect(savedUser?.signupSourceDetail).toBe('podcast');
  });

  it('should drop a detail when the source is not other', async () => {
    await useCase.execute({ userId: user.id, source: SignupSource.FRIENDS, detail: 'ignored' });

    const savedUser = userRepository.save.mock.calls[0]?.[0];
    expect(savedUser?.signupSource).toBe(SignupSource.FRIENDS);
    expect(savedUser?.signupSourceDetail).toBeUndefined();
  });
});
