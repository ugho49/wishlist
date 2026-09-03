import type { UserRepository } from '../../domain/repository/user.repository';
import type { UserAccountRepository } from '../../domain/repository/user-account.repository';
import type { UserPasswordVerificationRepository } from '../../domain/repository/user-password-verification.repository';
import type { UserSessionRepository } from '../../domain/repository/user-session.repository';

import { Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';

import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { UserAccountBuilder } from '../../../../test-utils/builders/user-account.builder';
import { UserPasswordVerificationBuilder } from '../../../../test-utils/builders/user-password-verification.builder';
import { createMock } from '../../../../test-utils/mocks';
import { PasswordManager } from '../../../auth/infrastructure/util/password-manager';
import { TransactionManager } from '../../../core/database/transaction-manager';
import { User } from '../../domain/model/user.model';
import { UserPasswordVerification } from '../../domain/model/user-password-verification.model';
import { UserAccountProvider } from '../../domain/user-account-provider.enum';
import { ResetUserPasswordUseCase } from './reset-user-password.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('ResetUserPasswordUseCase', () => {
  const userRepository = createMock<UserRepository>();
  const userAccountRepository = createMock<UserAccountRepository>();
  const passwordVerificationRepository = createMock<UserPasswordVerificationRepository>();
  const sessionRepository = createMock<UserSessionRepository>();
  const transactionManager = createMock<TransactionManager>();

  let useCase: ResetUserPasswordUseCase;
  let user: User;
  let verification: UserPasswordVerification;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    user = new UserBuilder().withEmail('jean@test.fr').build();
    verification = new UserPasswordVerificationBuilder().withUser(user).withToken('valid-token').build();

    userRepository.findByEmail.mockResolvedValue(user);
    userAccountRepository.findByUserIdAndProvider.mockResolvedValue(undefined);
    userAccountRepository.newId.mockReturnValue(new UserAccountBuilder().buildPassword(user, 'tmp').id);
    passwordVerificationRepository.findByUserId.mockResolvedValue([verification]);
    transactionManager.runInTransaction.mockImplementation(async callback => callback(undefined as never));

    useCase = new ResetUserPasswordUseCase(
      userRepository,
      userAccountRepository,
      passwordVerificationRepository,
      sessionRepository,
      transactionManager,
    );
  });

  it('should reject when the user does not exist', async () => {
    userRepository.findByEmail.mockResolvedValueOnce(undefined);

    await expect(
      useCase.execute({ email: 'unknown@test.fr', token: 'valid-token', newPassword: 'Secret123!' }),
    ).rejects.toThrow(NotFoundException);
    expect(transactionManager.runInTransaction).not.toHaveBeenCalled();
  });

  it('should reject when the reset token is not valid', async () => {
    await expect(
      useCase.execute({ email: user.email, token: 'wrong-token', newPassword: 'Secret123!' }),
    ).rejects.toThrow(UnauthorizedException);
    expect(transactionManager.runInTransaction).not.toHaveBeenCalled();
  });

  it('should reject when the reset token is expired', async () => {
    passwordVerificationRepository.findByUserId.mockResolvedValueOnce([
      new UserPasswordVerificationBuilder().withUser(user).withToken('valid-token').expired().build(),
    ]);

    await expect(
      useCase.execute({ email: user.email, token: 'valid-token', newPassword: 'Secret123!' }),
    ).rejects.toThrow(UnauthorizedException);
    expect(transactionManager.runInTransaction).not.toHaveBeenCalled();
  });

  it('should create a password account when the user has none', async () => {
    await useCase.execute({ email: user.email, token: 'valid-token', newPassword: 'NewSecret456!' });

    expect(userAccountRepository.save).toHaveBeenCalledTimes(1);
    const savedAccount = userAccountRepository.save.mock.calls[0]?.[0];
    expect(savedAccount?.provider).toBe(UserAccountProvider.PASSWORD);
    expect(savedAccount?.passwordHash).toBeDefined();
    expect(await PasswordManager.verify({ hash: savedAccount?.passwordHash, plainPassword: 'NewSecret456!' })).toBe(
      true,
    );
    expect(passwordVerificationRepository.delete).toHaveBeenCalledWith(verification.id, undefined);
    expect(sessionRepository.revokeAllByUserId).toHaveBeenCalledWith(user.id, { tx: undefined });
  });

  it('should update the existing password account', async () => {
    const existing = new UserAccountBuilder().buildPassword(user, await PasswordManager.hash('OldSecret123!'));
    userAccountRepository.findByUserIdAndProvider.mockResolvedValueOnce(existing);

    await useCase.execute({ email: user.email, token: 'valid-token', newPassword: 'NewSecret456!' });

    expect(userAccountRepository.save).toHaveBeenCalledTimes(1);
    const savedAccount = userAccountRepository.save.mock.calls[0]?.[0];
    expect(savedAccount?.id).toBe(existing.id);
    expect(await PasswordManager.verify({ hash: savedAccount?.passwordHash, plainPassword: 'NewSecret456!' })).toBe(
      true,
    );
  });
});
