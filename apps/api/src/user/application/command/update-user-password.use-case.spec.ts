import type { UserRepository } from '../../domain/repository/user.repository';

import { Logger } from '@nestjs/common';

import { UserBuilder } from '../../../../test-utils/builders/user.builder';
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

  let useCase: UpdateUserPasswordUseCase;
  let user: User;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(async () => {
    mock.clearAllMocks();

    const passwordHash = await PasswordManager.hash(OLD_PASSWORD);
    user = new UserBuilder().withEmail('jean@test.fr').withPasswordEnc(passwordHash).build();
    userRepository.findByIdOrFail.mockResolvedValue(user);

    useCase = new UpdateUserPasswordUseCase(userRepository);
  });

  it('should reject when the old password does not match', async () => {
    await expect(
      useCase.execute({ userId: user.id, oldPassword: 'WrongPassword1!', newPassword: NEW_PASSWORD }),
    ).rejects.toThrow(BusinessRuleException);
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('should update the password when the old password matches', async () => {
    await useCase.execute({ userId: user.id, oldPassword: OLD_PASSWORD, newPassword: NEW_PASSWORD });

    expect(userRepository.save).toHaveBeenCalledTimes(1);
    const savedUser = userRepository.save.mock.calls[0]?.[0];
    expect(savedUser?.passwordEnc).toBeDefined();
    expect(savedUser?.passwordEnc).not.toBe(user.passwordEnc);
    expect(await PasswordManager.verify({ hash: savedUser?.passwordEnc, plainPassword: NEW_PASSWORD })).toBe(true);
  });
});
