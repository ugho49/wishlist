import type { EventBus } from '@nestjs/cqrs';
import type { UserRepository } from '../../domain/repository/user.repository';
import type { UserEmailChangeVerificationRepository } from '../../domain/repository/user-email-change-verification.repository';

import { Logger, UnauthorizedException } from '@nestjs/common';

import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { UserEmailChangeVerificationBuilder } from '../../../../test-utils/builders/user-email-change-verification.builder';
import { createMock } from '../../../../test-utils/mocks';
import { TransactionManager } from '../../../core/database/transaction-manager';
import { EmailChangedEvent } from '../../domain/event/email-changed.event';
import { User } from '../../domain/model/user.model';
import { UserEmailChangeVerification } from '../../domain/model/user-email-change-verification.model';
import { ConfirmEmailChangeUseCase } from './confirm-email-change.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('ConfirmEmailChangeUseCase', () => {
  const userRepository = createMock<UserRepository>();
  const emailChangeVerificationRepository = createMock<UserEmailChangeVerificationRepository>();
  const transactionManager = createMock<TransactionManager>();
  const eventBus = createMock<EventBus>();

  let useCase: ConfirmEmailChangeUseCase;
  let user: User;
  let verification: UserEmailChangeVerification;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    user = new UserBuilder().withEmail('jean@test.fr').build();
    verification = new UserEmailChangeVerificationBuilder()
      .withUser(user)
      .withNewEmail('new@test.fr')
      .withToken('valid-token')
      .build();

    emailChangeVerificationRepository.findByTokenAndEmail.mockResolvedValue(verification);
    userRepository.findByEmail.mockResolvedValue(undefined);
    transactionManager.runInTransaction.mockImplementation(async callback => callback(undefined as never));

    useCase = new ConfirmEmailChangeUseCase(
      userRepository,
      emailChangeVerificationRepository,
      transactionManager,
      eventBus,
    );
  });

  it('should reject when the verification is not found', async () => {
    emailChangeVerificationRepository.findByTokenAndEmail.mockResolvedValueOnce(undefined);

    await expect(useCase.execute({ newEmail: 'new@test.fr', token: 'valid-token' })).rejects.toThrow(
      UnauthorizedException,
    );
    expect(transactionManager.runInTransaction).not.toHaveBeenCalled();
    expect(eventBus.publish).not.toHaveBeenCalled();
  });

  it('should reject when the verification is expired', async () => {
    emailChangeVerificationRepository.findByTokenAndEmail.mockResolvedValueOnce(
      new UserEmailChangeVerificationBuilder()
        .withUser(user)
        .withNewEmail('new@test.fr')
        .withToken('valid-token')
        .expired()
        .build(),
    );

    await expect(useCase.execute({ newEmail: 'new@test.fr', token: 'valid-token' })).rejects.toThrow(
      UnauthorizedException,
    );
    expect(transactionManager.runInTransaction).not.toHaveBeenCalled();
  });

  it('should reject when the new email is already used by another user', async () => {
    userRepository.findByEmail.mockResolvedValueOnce(new UserBuilder().withEmail('new@test.fr').build());

    await expect(useCase.execute({ newEmail: 'new@test.fr', token: 'valid-token' })).rejects.toThrow(
      UnauthorizedException,
    );
    expect(transactionManager.runInTransaction).not.toHaveBeenCalled();
  });

  it('should update the email, invalidate the verification and publish an event', async () => {
    await useCase.execute({ newEmail: 'NEW@test.fr', token: 'valid-token' });

    expect(userRepository.save).toHaveBeenCalledTimes(1);
    const savedUser = userRepository.save.mock.calls[0]?.[0];
    expect(savedUser?.email).toBe('new@test.fr');
    expect(emailChangeVerificationRepository.save).toHaveBeenCalledTimes(1);
    const savedVerification = emailChangeVerificationRepository.save.mock.calls[0]?.[0];
    expect(savedVerification?.expiredAt.getTime()).toBeLessThan(verification.expiredAt.getTime());
    expect(eventBus.publish).toHaveBeenCalledTimes(1);
    expect(eventBus.publish.mock.calls[0]?.[0]).toBeInstanceOf(EmailChangedEvent);
  });

  it('should allow confirming when the new email still belongs to the same user', async () => {
    userRepository.findByEmail.mockResolvedValueOnce(user);

    await useCase.execute({ newEmail: 'new@test.fr', token: 'valid-token' });

    expect(userRepository.save).toHaveBeenCalledTimes(1);
    expect(eventBus.publish).toHaveBeenCalledTimes(1);
  });
});
