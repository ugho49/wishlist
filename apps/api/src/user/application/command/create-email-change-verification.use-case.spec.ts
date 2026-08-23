import type { EventBus } from '@nestjs/cqrs';
import type { UserEmailChangeVerificationId } from '@wishlist/common';
import type { UserRepository } from '../../domain/repository/user.repository';
import type { UserEmailChangeVerificationRepository } from '../../domain/repository/user-email-change-verification.repository';

import { BadRequestException, Logger, UnauthorizedException } from '@nestjs/common';
import { uuid } from '@wishlist/common';

import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { UserEmailChangeVerificationBuilder } from '../../../../test-utils/builders/user-email-change-verification.builder';
import { createMock } from '../../../../test-utils/mocks';
import { EmailChangeVerificationCreatedEvent } from '../../domain/event/email-change-verification-created.event';
import { User } from '../../domain/model/user.model';
import { CreateEmailChangeVerificationUseCase } from './create-email-change-verification.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('CreateEmailChangeVerificationUseCase', () => {
  const userRepository = createMock<UserRepository>();
  const emailChangeVerificationRepository = createMock<UserEmailChangeVerificationRepository>();
  const eventBus = createMock<EventBus>();
  const config = {
    resetPasswordTokenDurationInMinutes: 15,
    emailChangeVerificationTokenDurationInMinutes: 60,
  };

  let useCase: CreateEmailChangeVerificationUseCase;
  let user: User;
  let verificationId: UserEmailChangeVerificationId;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    user = new UserBuilder().withEmail('jean@test.fr').build();
    verificationId = uuid() as UserEmailChangeVerificationId;

    userRepository.findByIdOrFail.mockResolvedValue(user);
    userRepository.findByEmail.mockResolvedValue(undefined);
    emailChangeVerificationRepository.findByUserId.mockResolvedValue([]);
    emailChangeVerificationRepository.newId.mockReturnValue(verificationId);

    useCase = new CreateEmailChangeVerificationUseCase(
      userRepository,
      emailChangeVerificationRepository,
      config,
      eventBus,
    );
  });

  it('should reject when the new email is the same as the current email', async () => {
    await expect(useCase.execute({ currentUser: toCurrentUser(user), newEmail: 'Jean@test.fr' })).rejects.toThrow(
      BadRequestException,
    );
    expect(emailChangeVerificationRepository.save).not.toHaveBeenCalled();
    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it('should reject when the new email is already taken', async () => {
    userRepository.findByEmail.mockResolvedValueOnce(new UserBuilder().withEmail('taken@test.fr').build());

    await expect(useCase.execute({ currentUser: toCurrentUser(user), newEmail: 'taken@test.fr' })).rejects.toThrow(
      BadRequestException,
    );
    expect(emailChangeVerificationRepository.save).not.toHaveBeenCalled();
  });

  it('should reject when an email change request is already pending', async () => {
    emailChangeVerificationRepository.findByUserId.mockResolvedValueOnce([
      new UserEmailChangeVerificationBuilder().withUser(user).build(),
    ]);

    await expect(useCase.execute({ currentUser: toCurrentUser(user), newEmail: 'new@test.fr' })).rejects.toThrow(
      UnauthorizedException,
    );
    expect(emailChangeVerificationRepository.save).not.toHaveBeenCalled();
  });

  it('should create a verification when previous ones are expired', async () => {
    emailChangeVerificationRepository.findByUserId.mockResolvedValueOnce([
      new UserEmailChangeVerificationBuilder().withUser(user).expired().build(),
    ]);

    await useCase.execute({ currentUser: toCurrentUser(user), newEmail: 'NEW@test.fr' });

    expect(emailChangeVerificationRepository.save).toHaveBeenCalledTimes(1);
    const saved = emailChangeVerificationRepository.save.mock.calls[0]?.[0];
    expect(saved?.id).toBe(verificationId);
    expect(saved?.newEmail).toBe('new@test.fr');
    expect(saved?.user.id).toBe(user.id);
    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    expect(eventBus.publish.mock.calls[0]?.[0]).toBeInstanceOf(EmailChangeVerificationCreatedEvent);
  });
});
