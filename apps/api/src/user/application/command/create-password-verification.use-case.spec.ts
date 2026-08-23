import type { EventBus } from '@nestjs/cqrs';
import type { UserPasswordVerificationId } from '@wishlist/common';
import type { UserRepository } from '../../domain/repository/user.repository';
import type { UserPasswordVerificationRepository } from '../../domain/repository/user-password-verification.repository';

import { Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { uuid } from '@wishlist/common';

import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { UserPasswordVerificationBuilder } from '../../../../test-utils/builders/user-password-verification.builder';
import { createMock } from '../../../../test-utils/mocks';
import { PasswordVerificationCreatedEvent } from '../../domain/event/password-verification-created.event';
import { User } from '../../domain/model/user.model';
import { CreatePasswordVerificationUseCase } from './create-password-verification.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('CreatePasswordVerificationUseCase', () => {
  const userRepository = createMock<UserRepository>();
  const verificationEntityRepository = createMock<UserPasswordVerificationRepository>();
  const eventBus = createMock<EventBus>();
  const config = {
    resetPasswordTokenDurationInMinutes: 15,
    emailChangeVerificationTokenDurationInMinutes: 60,
  };

  let useCase: CreatePasswordVerificationUseCase;
  let user: User;
  let verificationId: UserPasswordVerificationId;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    user = new UserBuilder().withEmail('jean@test.fr').build();
    verificationId = uuid() as UserPasswordVerificationId;

    userRepository.findByEmail.mockResolvedValue(user);
    verificationEntityRepository.findByUserId.mockResolvedValue([]);
    verificationEntityRepository.newId.mockReturnValue(verificationId);

    useCase = new CreatePasswordVerificationUseCase(userRepository, verificationEntityRepository, config, eventBus);
  });

  it('should reject when the user does not exist', async () => {
    userRepository.findByEmail.mockResolvedValueOnce(undefined);

    await expect(useCase.execute({ email: 'unknown@test.fr' })).rejects.toThrow(NotFoundException);
    expect(verificationEntityRepository.save).not.toHaveBeenCalled();
    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it('should reject when a reset email has already been sent', async () => {
    verificationEntityRepository.findByUserId.mockResolvedValueOnce([
      new UserPasswordVerificationBuilder().withUser(user).build(),
    ]);

    await expect(useCase.execute({ email: user.email })).rejects.toThrow(UnauthorizedException);
    expect(verificationEntityRepository.save).not.toHaveBeenCalled();
  });

  it('should create a verification when previous ones are expired', async () => {
    verificationEntityRepository.findByUserId.mockResolvedValueOnce([
      new UserPasswordVerificationBuilder().withUser(user).expired().build(),
    ]);

    await useCase.execute({ email: user.email });

    expect(verificationEntityRepository.save).toHaveBeenCalledTimes(1);
    const saved = verificationEntityRepository.save.mock.calls[0]?.[0];
    expect(saved?.id).toBe(verificationId);
    expect(saved?.user.id).toBe(user.id);
    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    expect(eventBus.publish.mock.calls[0]?.[0]).toBeInstanceOf(PasswordVerificationCreatedEvent);
  });
});
