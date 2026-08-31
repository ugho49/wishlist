import type { UserRepository } from '../../domain/repository/user.repository';
import type { UserAccountRepository } from '../../domain/repository/user-account.repository';
import type { UserRefreshTokenRepository } from '../../domain/repository/user-refresh-token.repository';

import { Logger } from '@nestjs/common';

import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { UserAccountBuilder } from '../../../../test-utils/builders/user-account.builder';
import { createMock } from '../../../../test-utils/mocks';
import { PasswordManager } from '../../../auth/infrastructure/util/password-manager';
import { BusinessRuleException } from '../../../core/common/business-rule.exception';
import { User } from '../../domain/model/user.model';
import { UpdateUserPasswordUseCase } from './update-user-password.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

const OLD_PASSWORD = 'Secret123!';
const NEW_PASSWORD = 'NewSecret456!';

describe('UpdateUserPasswordUseCase', () => {
  const userRepository = createMock<UserRepository>();
  const userAccountRepository = createMock<UserAccountRepository>();
  const refreshTokenRepository = createMock<UserRefreshTokenRepository>();

  let useCase: UpdateUserPasswordUseCase;
  let user: User;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(async () => {
    mock.clearAllMocks();

    const passwordHash = await PasswordManager.hash(OLD_PASSWORD);
    user = new UserBuilder().withEmail('jean@test.fr').build();
    userRepository.findByIdOrFail.mockResolvedValue(user);
    userAccountRepository.findByUserIdAndProvider.mockResolvedValue(
      new UserAccountBuilder().buildPassword(user, passwordHash),
    );

    useCase = new UpdateUserPasswordUseCase(userRepository, userAccountRepository, refreshTokenRepository);
  });

  it('should reject when the old password does not match', async () => {
    await expect(
      useCase.execute({ currentUser: toCurrentUser(user), oldPassword: 'WrongPassword1!', newPassword: NEW_PASSWORD }),
    ).rejects.toThrow(BusinessRuleException);
    expect(userAccountRepository.save).not.toHaveBeenCalled();
    expect(refreshTokenRepository.revokeAllByUserId).not.toHaveBeenCalled();
  });

  it('should update the password when the old password matches', async () => {
    const existingAccount = await userAccountRepository.findByUserIdAndProvider(user.id);
    await useCase.execute({ currentUser: toCurrentUser(user), oldPassword: OLD_PASSWORD, newPassword: NEW_PASSWORD });

    expect(userAccountRepository.save).toHaveBeenCalledTimes(1);
    const savedAccount = userAccountRepository.save.mock.calls[0]?.[0];
    expect(savedAccount?.passwordHash).toBeDefined();
    expect(savedAccount?.passwordHash).not.toBe(existingAccount?.passwordHash);
    expect(await PasswordManager.verify({ hash: savedAccount?.passwordHash, plainPassword: NEW_PASSWORD })).toBe(true);
    expect(refreshTokenRepository.revokeAllByUserId).toHaveBeenCalledWith(user.id, { exceptId: undefined });
  });
});
