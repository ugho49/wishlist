import type { UserRepository } from '../../domain/repository/user.repository';
import type { UserPasswordVerificationRepository } from '../../domain/repository/user-password-verification.repository';

import { Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';

import { UserBuilder } from '../../../../test-utils/builders/user.builder';
import { UserPasswordVerificationBuilder } from '../../../../test-utils/builders/user-password-verification.builder';
import { createMock } from '../../../../test-utils/mocks';
import { PasswordManager } from '../../../auth/infrastructure/util/password-manager';
import { TransactionManager } from '../../../core/database/transaction-manager';
import { User } from '../../domain/model/user.model';
import { UserPasswordVerification } from '../../domain/model/user-password-verification.model';
import { ResetUserPasswordUseCase } from './reset-user-password.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('ResetUserPasswordUseCase', () => {
  const userRepository = createMock<UserRepository>();
  const passwordVerificationRepository = createMock<UserPasswordVerificationRepository>();
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
    passwordVerificationRepository.findByUserId.mockResolvedValue([verification]);
    transactionManager.runInTransaction.mockImplementation(async callback => callback(undefined as never));

    useCase = new ResetUserPasswordUseCase(userRepository, passwordVerificationRepository, transactionManager);
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

  it('should update the password and delete the verification', async () => {
    await useCase.execute({ email: user.email, token: 'valid-token', newPassword: 'NewSecret456!' });

    expect(userRepository.save).toHaveBeenCalledTimes(1);
    const savedUser = userRepository.save.mock.calls[0]?.[0];
    expect(savedUser?.passwordEnc).toBeDefined();
    expect(await PasswordManager.verify({ hash: savedUser?.passwordEnc, plainPassword: 'NewSecret456!' })).toBe(true);
    expect(passwordVerificationRepository.delete).toHaveBeenCalledWith(verification.id, undefined);
  });
});
