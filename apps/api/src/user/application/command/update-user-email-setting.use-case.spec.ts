import type { UserEmailSettingRepository } from '../../domain/repository/user-email-setting.repository';

import { Logger, NotFoundException } from '@nestjs/common';

import { toCurrentUser, UserBuilder } from '../../../../test-utils/builders/user.builder';
import { UserEmailSettingBuilder } from '../../../../test-utils/builders/user-email-setting.builder';
import { createMock } from '../../../../test-utils/mocks';
import { User } from '../../domain/model/user.model';
import { UserEmailSetting } from '../../domain/model/user-email-setting.model';
import { UpdateUserEmailSettingUseCase } from './update-user-email-setting.use-case';
import { beforeAll, beforeEach, describe, expect, it, mock } from 'bun:test';

describe('UpdateUserEmailSettingUseCase', () => {
  const userEmailSettingRepository = createMock<UserEmailSettingRepository>();

  let useCase: UpdateUserEmailSettingUseCase;
  let user: User;
  let userEmailSetting: UserEmailSetting;

  beforeAll(() => {
    Logger.overrideLogger(false);
  });

  beforeEach(() => {
    mock.clearAllMocks();

    user = new UserBuilder().withEmail('jean@test.fr').build();
    userEmailSetting = new UserEmailSettingBuilder().withUser(user).withDailyNewItemNotification(true).build();
    userEmailSettingRepository.findByUserId.mockResolvedValue(userEmailSetting);

    useCase = new UpdateUserEmailSettingUseCase(userEmailSettingRepository);
  });

  it('should reject when the email setting does not exist', async () => {
    userEmailSettingRepository.findByUserId.mockResolvedValueOnce(undefined);

    await expect(
      useCase.execute({ currentUser: toCurrentUser(user), dailyNewItemNotification: false }),
    ).rejects.toThrow(NotFoundException);
    expect(userEmailSettingRepository.save).not.toHaveBeenCalled();
  });

  it('should update and persist the email setting', async () => {
    const { userEmailSetting: updated } = await useCase.execute({
      currentUser: toCurrentUser(user),
      dailyNewItemNotification: false,
    });

    expect(updated.dailyNewItemNotification).toBe(false);
    expect(userEmailSettingRepository.save).toHaveBeenCalledWith(updated);
  });
});
