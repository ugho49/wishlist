import type { EventBus } from '@nestjs/cqrs';
import type { UserId } from '@wishlist/common';
import type { UserRepository } from '../../domain/repository/user.repository';

import { Logger, UnauthorizedException } from '@nestjs/common';
import { uuid } from '@wishlist/common';

import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { UserCreatedEvent } from '../../domain/event/user-created.event';
import { User } from '../../domain/model/user.model';
import { CreateUserUseCase } from './create-user.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('CreateUserUseCase', () => {
  const userRepository = createMock<UserRepository>();
  const eventBus = createMock<EventBus>();

  let useCase: CreateUserUseCase;
  let userId: UserId;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    userId = uuid() as UserId;
    userRepository.newId.mockReturnValue(userId);
    userRepository.findByEmail.mockResolvedValue(undefined);

    useCase = new CreateUserUseCase(userRepository, eventBus);
  });

  it('should reject when the email is already taken', async () => {
    userRepository.findByEmail.mockResolvedValueOnce(new UserBuilder().withEmail('taken@test.fr').build());

    await expect(
      useCase.execute({
        newUser: {
          firstname: 'Jean',
          lastname: 'Dupont',
          email: 'taken@test.fr',
          password: 'Secret123!',
        },
        ip: '127.0.0.1',
      }),
    ).rejects.toThrow(UnauthorizedException);
    expect(userRepository.save).not.toHaveBeenCalled();
    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it('should create the user, persist and publish an event', async () => {
    const { user } = await useCase.execute({
      newUser: {
        firstname: 'Jean',
        lastname: 'Dupont',
        email: 'jean@test.fr',
        password: 'Secret123!',
        birthday: new Date('1990-01-01'),
      },
      ip: '127.0.0.1',
    });

    expect(user).toBeInstanceOf(User);
    expect(user.id).toBe(userId);
    expect(user.email).toBe('jean@test.fr');
    expect(user.firstName).toBe('Jean');
    expect(user.lastName).toBe('Dupont');
    expect(user.passwordEnc).toBeDefined();
    expect(userRepository.save).toHaveBeenCalledWith(user);
    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    expect(eventBus.publish.mock.calls[0]?.[0]).toBeInstanceOf(UserCreatedEvent);
  });
});
