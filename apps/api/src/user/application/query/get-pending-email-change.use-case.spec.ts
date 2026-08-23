import type { UserEmailChangeVerificationRepository } from '../../domain/repository/user-email-change-verification.repository';

import { Logger } from '@nestjs/common';

import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { UserEmailChangeVerificationBuilder } from '../../../../test-utils/builders/user-email-change-verification.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../domain/model/user.model';
import { GetPendingEmailChangeUseCase } from './get-pending-email-change.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('GetPendingEmailChangeUseCase', () => {
  const emailChangeVerificationRepository = createMock<UserEmailChangeVerificationRepository>();

  let useCase: GetPendingEmailChangeUseCase;
  let user: User;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    user = new UserBuilder().withEmail('jean@test.fr').build();
    emailChangeVerificationRepository.findByUserId.mockResolvedValue([]);

    useCase = new GetPendingEmailChangeUseCase(emailChangeVerificationRepository);
  });

  it('should return undefined when there is no pending verification', async () => {
    const result = await useCase.execute({ currentUser: toCurrentUser(user) });

    expect(result).toBeUndefined();
  });

  it('should return undefined when all verifications are expired', async () => {
    emailChangeVerificationRepository.findByUserId.mockResolvedValueOnce([
      new UserEmailChangeVerificationBuilder().withUser(user).expired().build(),
    ]);

    const result = await useCase.execute({ currentUser: toCurrentUser(user) });

    expect(result).toBeUndefined();
  });

  it('should return the active pending email change', async () => {
    const verification = new UserEmailChangeVerificationBuilder().withUser(user).withNewEmail('new@test.fr').build();
    emailChangeVerificationRepository.findByUserId.mockResolvedValueOnce([verification]);

    const result = await useCase.execute({ currentUser: toCurrentUser(user) });

    expect(result).toEqual({
      newEmail: 'new@test.fr',
      expiredAt: verification.expiredAt.toISOString(),
    });
  });
});
