import type { EventBus } from '@nestjs/cqrs';
import type { UserId } from '@wishlist/common';
import type { UserRepository } from '../../domain/repository/user.repository';
import type { UserAccountRepository } from '../../domain/repository/user-account.repository';

import { Logger, UnauthorizedException } from '@nestjs/common';
import { uuid } from '@wishlist/common';

import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { createMock } from '../../../../test-utils/mocks';
import { TransactionManager } from '../../../core/database/transaction-manager';
import { UserCreatedEvent } from '../../domain/event/user-created.event';
import { User } from '../../domain/model/user.model';
import { UserAccount } from '../../domain/model/user-account.model';
import { UserAccountProvider } from '../../domain/user-account-provider.enum';
import { CreateUserUseCase } from './create-user.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('CreateUserUseCase', () => {
  const userRepository = createMock<UserRepository>();
  const userAccountRepository = createMock<UserAccountRepository>();
  const transactionManager = createMock<TransactionManager>();
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
    userAccountRepository.newId.mockReturnValue(uuid() as never);
    transactionManager.runInTransaction.mockImplementation(async callback => callback(undefined as never));

    useCase = new CreateUserUseCase(userRepository, userAccountRepository, transactionManager, eventBus);
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
      }),
    ).rejects.toThrow(UnauthorizedException);
    expect(userRepository.save).not.toHaveBeenCalled();
    expect(userAccountRepository.save).not.toHaveBeenCalled();
    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it('should create the user, persist a password account and publish an event', async () => {
    const { user } = await useCase.execute({
      newUser: {
        firstname: 'Jean',
        lastname: 'Dupont',
        email: 'jean@test.fr',
        password: 'Secret123!',
        birthday: new Date('1990-01-01'),
      },
    });

    expect(user).toBeInstanceOf(User);
    expect(user.id).toBe(userId);
    expect(user.email).toBe('jean@test.fr');
    expect(user.firstName).toBe('Jean');
    expect(user.lastName).toBe('Dupont');
    expect(userRepository.save).toHaveBeenCalledWith(user, undefined);
    expect(userAccountRepository.save).toHaveBeenCalledTimes(1);
    const savedAccount = userAccountRepository.save.mock.calls[0]?.[0];
    expect(savedAccount).toBeInstanceOf(UserAccount);
    expect(savedAccount?.provider).toBe(UserAccountProvider.PASSWORD);
    expect(savedAccount?.email).toBe('jean@test.fr');
    expect(savedAccount?.passwordHash).toBeDefined();
    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    expect(eventBus.publish.mock.calls[0]?.[0]).toBeInstanceOf(UserCreatedEvent);
  });
});
