import type { UserPasswordVerificationId } from '@wishlist/common';
import type { UserRepository } from '../../domain/repository/user.repository';
import type { UserPasswordVerificationRepository } from '../../domain/repository/user-password-verification.repository';

import { uuid } from '@wishlist/common';
import { EventPublisher } from '@znight/events';

import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { UserPasswordVerificationBuilder } from '../../../../test-utils/builders/user-password-verification.builder';
import { createMock } from '../../../../test-utils/mocks';
import { PasswordResetRequestedEvent } from '../../domain/event/password-reset-requested.event';
import { User } from '../../domain/model/user.model';
import { CreatePasswordVerificationUseCase } from './create-password-verification.use-case';
import { beforeEach, describe, expect, it, mock } from 'bun:test';

describe('CreatePasswordVerificationUseCase', () => {
  const userRepository = createMock<UserRepository>();
  const verificationEntityRepository = createMock<UserPasswordVerificationRepository>();
  const eventBus = createMock<EventPublisher>();
  const config = {
    resetPasswordTokenDurationInMinutes: 15,
    emailChangeVerificationTokenDurationInMinutes: 60,
  };

  let useCase: CreatePasswordVerificationUseCase;
  let user: User;
  let verificationId: UserPasswordVerificationId;

  beforeEach(() => {
    mock.clearAllMocks();

    user = new UserBuilder().withEmail('jean@test.fr').build();
    verificationId = uuid() as UserPasswordVerificationId;

    userRepository.findByEmail.mockResolvedValue(user);
    verificationEntityRepository.findByUserId.mockResolvedValue([]);
    verificationEntityRepository.newId.mockReturnValue(verificationId);

    useCase = new CreatePasswordVerificationUseCase(userRepository, verificationEntityRepository, config, eventBus);
  });

  it('should answer without error nor email when the email has no account', async () => {
    userRepository.findByEmail.mockResolvedValueOnce(undefined);

    await expect(useCase.execute({ email: 'unknown@test.fr' })).resolves.toBeUndefined();
    expect(verificationEntityRepository.save).not.toHaveBeenCalled();
    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it('should send the pending code again when a reset email has already been sent', async () => {
    verificationEntityRepository.findByUserId.mockResolvedValueOnce([
      new UserPasswordVerificationBuilder().withUser(user).withToken('pending-token').build(),
    ]);

    await expect(useCase.execute({ email: user.email })).resolves.toBeUndefined();

    expect(verificationEntityRepository.save).not.toHaveBeenCalled();
    expect(eventBus.publish).toHaveBeenCalledWith(
      new PasswordResetRequestedEvent({ email: user.email, token: 'pending-token' }),
    );
  });

  it('should send the pending code that expires last when several are still valid', async () => {
    verificationEntityRepository.findByUserId.mockResolvedValueOnce([
      new UserPasswordVerificationBuilder().withUser(user).withToken('expired-token').expired().build(),
      new UserPasswordVerificationBuilder().withUser(user).withToken('older-token').expiringIn({ minutes: 5 }).build(),
      new UserPasswordVerificationBuilder().withUser(user).withToken('newer-token').expiringIn({ minutes: 10 }).build(),
    ]);

    await useCase.execute({ email: user.email });

    expect(eventBus.publish).toHaveBeenCalledWith(
      new PasswordResetRequestedEvent({ email: user.email, token: 'newer-token' }),
    );
  });

  it('should create a verification and email its code when previous ones are expired', async () => {
    verificationEntityRepository.findByUserId.mockResolvedValueOnce([
      new UserPasswordVerificationBuilder().withUser(user).expired().build(),
    ]);

    await useCase.execute({ email: user.email });

    expect(verificationEntityRepository.save).toHaveBeenCalledTimes(1);
    const saved = verificationEntityRepository.save.mock.calls[0]?.[0];
    expect(saved?.id).toBe(verificationId);
    expect(saved?.user.id).toBe(user.id);
    expect(saved?.token).toMatch(/^[0-9a-z]{20}$/);
    expect(eventBus.publish).toHaveBeenCalledWith(
      new PasswordResetRequestedEvent({ email: user.email, token: saved?.token ?? '' }),
    );
  });
});
